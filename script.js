class PatientNode {
    constructor(name, age, triageLevel, condition) {
        this.id = 'PT-' + Math.floor(Math.random() * 10000);
        this.name = name;
        this.age = age;
        this.triageLevel = parseInt(triageLevel);
        this.condition = condition;
        this.timestamp = Date.now();
    }
}

class MinHeap {
    constructor() {
        this.heap = [];
    }

    getLeftChildIndex(parentIndex) { return 2 * parentIndex + 1; }
    getRightChildIndex(parentIndex) { return 2 * parentIndex + 2; }
    getParentIndex(childIndex) { return Math.floor((childIndex - 1) / 2); }

    hasLeftChild(index) { return this.getLeftChildIndex(index) < this.heap.length; }
    hasRightChild(index) { return this.getRightChildIndex(index) < this.heap.length; }
    hasParent(index) { return this.getParentIndex(index) >= 0; }

    leftChild(index) { return this.heap[this.getLeftChildIndex(index)]; }
    rightChild(index) { return this.heap[this.getRightChildIndex(index)]; }
    parent(index) { return this.heap[this.getParentIndex(index)]; }

    swap(indexOne, indexTwo) {
        const temp = this.heap[indexOne];
        this.heap[indexOne] = this.heap[indexTwo];
        this.heap[indexTwo] = temp;
    }

    peek() {
        if (this.heap.length === 0) return null;
        return this.heap[0];
    }

    insert(patient) {
        this.heap.push(patient);
        this.heapifyUp();
    }

    extractMin() {
        if (this.heap.length === 0) return null;
        if (this.heap.length === 1) return this.heap.pop();
        
        const min = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.heapifyDown();
        return min;
    }

    removeNodeById(id) {
        const index = this.heap.findIndex(p => p.id === id);
        if (index === -1) return false;
        
        if (index === this.heap.length - 1) {
            this.heap.pop();
            return true;
        }

        this.swap(index, this.heap.length - 1);
        this.heap.pop();
        
        if (this.hasParent(index) && this.compare(this.heap[index], this.parent(index)) < 0) {
            this.heapifyUp(index);
        } else {
            this.heapifyDown(index);
        }
        return true;
    }

    compare(a, b) {
        if (!a || !b) return 0;
        if (a.triageLevel !== b.triageLevel) {
            return a.triageLevel - b.triageLevel;
        }
        return a.timestamp - b.timestamp;
    }

    heapifyUp(index = this.heap.length - 1) {
        while (this.hasParent(index) && this.compare(this.heap[index], this.parent(index)) < 0) {
            this.swap(this.getParentIndex(index), index);
            index = this.getParentIndex(index);
        }
    }

    heapifyDown(index = 0) {
        while (this.hasLeftChild(index)) {
            let smallerChildIndex = this.getLeftChildIndex(index);
            if (this.hasRightChild(index) && this.compare(this.rightChild(index), this.leftChild(index)) < 0) {
                smallerChildIndex = this.getRightChildIndex(index);
            }

            if (this.compare(this.heap[index], this.heap[smallerChildIndex]) < 0) {
                break;
            } else {
                this.swap(index, smallerChildIndex);
            }
            index = smallerChildIndex;
        }
    }

    getSortedQueue() {
        const tempHeap = new MinHeap();
        tempHeap.heap = [...this.heap];
        const result = [];
        
        while (tempHeap.heap.length > 0) {
            result.push(tempHeap.extractMin());
        }
        return result;
    }
}

// =============================================
// FIREBASE REALTIME DATABASE INTEGRATION
// Data syncs across ALL devices in real-time
// =============================================

const erQueue = new MinHeap();
const actionStack = []; // for undo (local only — undo is per-device)

// Firebase database references
const db = firebase.database();
const patientsRef = db.ref('erqueue/patients');
const connectedRef = db.ref('.info/connected');

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("admitForm");
    const queueList = document.getElementById("queueList");
    const queueCount = document.getElementById("queueCount");
    const btnUndo = document.getElementById("btnUndo");
    const btnClear = document.getElementById("btnClear");
    const syncBadge = document.getElementById("syncStatus");

    // ---- Connection Status Monitor ----
    connectedRef.on('value', (snap) => {
        if (snap.val() === true) {
            syncBadge.innerHTML = '<i class="ri-wifi-line"></i> Live Sync';
            syncBadge.className = 'sync-badge online';
        } else {
            syncBadge.innerHTML = '<i class="ri-wifi-off-line"></i> Offline';
            syncBadge.className = 'sync-badge offline';
        }
    });

    // ---- Save to Firebase Cloud ----
    const saveToFirebase = () => {
        patientsRef.set(erQueue.heap).catch(err => {
            console.error("Firebase write error:", err);
            // Fallback: save to localStorage
            localStorage.setItem('erQueuePatients', JSON.stringify(erQueue.heap));
        });
    };

    // ---- Helper Functions ----
    const getTriageClass = (level) => {
        switch(level) {
            case 1: return 'critical';
            case 2: return 'severe';
            case 3: return 'moderate';
            case 4: return 'minor';
            default: return 'minor';
        }
    };

    const getTriageText = (level) => {
        switch(level) {
            case 1: return 'CRITICAL';
            case 2: return 'SEVERE';
            case 3: return 'MODERATE';
            case 4: return 'MINOR';
            default: return 'UNKNOWN';
        }
    };

    // ---- Render Queue (UI only, no saving) ----
    const renderQueue = () => {
        const sorted = erQueue.getSortedQueue();
        queueCount.innerText = `${sorted.length} Patient${sorted.length !== 1 ? 's' : ''} Waiting`;

        if (sorted.length === 0) {
            queueList.innerHTML = `
                <div class="empty-state">
                    <i class="ri-inbox-archive-line" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>No patients in the current queue.</p>
                </div>
            `;
            return;
        }

        queueList.innerHTML = '';
        sorted.forEach((p, index) => {
            const div = document.createElement("div");
            div.className = "queue-item";
            div.innerHTML = `
                <div class="qi-index">#${index + 1}</div>
                <div class="qi-details">
                    <div class="qi-name">${p.name} <span class="badge-triage ${getTriageClass(p.triageLevel)}" style="margin-left:10px; font-size: 0.65rem;">${getTriageText(p.triageLevel)}</span></div>
                    <div class="qi-cond">${p.age} yrs • ${p.condition} • ID: ${p.id}</div>
                </div>
            `;
            queueList.appendChild(div);
        });
    };

    // ================================================
    // REAL-TIME LISTENER — This is the magic!
    // Fires whenever data changes in Firebase (from ANY device).
    // All connected browsers see the update instantly.
    // ================================================
    patientsRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            // Firebase may return an object or array — normalize to array
            erQueue.heap = Array.isArray(data) ? data : Object.values(data);
        } else {
            erQueue.heap = [];
        }
        renderQueue();
    }, (error) => {
        console.error("Firebase read error:", error);
        // Fallback: try loading from localStorage
        const saved = localStorage.getItem('erQueuePatients');
        if (saved) {
            try {
                erQueue.heap = JSON.parse(saved);
                renderQueue();
            } catch (e) {
                console.error("Error parsing saved patients");
            }
        }
    });

    // ---- Form Submit: Add Patient ----
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("pName").value;
        const age = document.getElementById("pAge").value;
        const triage = document.getElementById("pTriage").value;
        const condition = document.getElementById("pCondition").value;

        const p = new PatientNode(name, age, triage, condition);
        erQueue.insert(p);
        actionStack.push({ type: 'ADD', patientId: p.id });
        
        form.reset();
        saveToFirebase(); // Triggers real-time update on ALL devices
    });

    // ---- Undo Last Action ----
    btnUndo.addEventListener("click", () => {
        if (actionStack.length === 0) return;
        const lastAction = actionStack.pop();
        if (lastAction.type === 'ADD') {
            erQueue.removeNodeById(lastAction.patientId);
            saveToFirebase();
        }
    });

    // ---- Clear All ----
    btnClear.addEventListener("click", () => {
        erQueue.heap = [];
        actionStack.length = 0;
        saveToFirebase();
    });
});
