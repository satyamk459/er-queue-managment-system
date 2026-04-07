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
        
        // Adjust
        if (this.hasParent(index) && this.compare(this.heap[index], this.parent(index)) < 0) {
            this.heapifyUp(index);
        } else {
            this.heapifyDown(index);
        }
        return true;
    }

    // Compare logic: Lower triage level is higher priority. 
    // If same, older timestamp is higher priority.
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

    // Return a sorted array without modifying the actual heap
    getSortedQueue() {
        const tempHeap = new MinHeap();
        tempHeap.heap = [...this.heap]; // shallow clone is fine here since nodes are objects 
        const result = [];
        
        while (tempHeap.heap.length > 0) {
            result.push(tempHeap.extractMin());
        }
        return result;
    }
}

// Global scope
const erQueue = new MinHeap();
const actionStack = []; // for undo

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("admitForm");
    const queueList = document.getElementById("queueList");
    const queueCount = document.getElementById("queueCount");
    const btnUndo = document.getElementById("btnUndo");
    const btnClear = document.getElementById("btnClear");

    const loadData = () => {
        const saved = localStorage.getItem('erQueuePatients');
        if (saved) {
            try {
                erQueue.heap = JSON.parse(saved);
            } catch (e) {
                console.error("Error parsing saved patients");
            }
        }
    };

    const saveData = () => {
        localStorage.setItem('erQueuePatients', JSON.stringify(erQueue.heap));
    };

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

    const updateUI = () => {
        saveData(); // Save state to localStorage whenever UI updates
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
        updateUI();
    });

    btnUndo.addEventListener("click", () => {
        if (actionStack.length === 0) return;
        const lastAction = actionStack.pop();
        if (lastAction.type === 'ADD') {
            erQueue.removeNodeById(lastAction.patientId);
            updateUI();
        }
    });

    btnClear.addEventListener("click", () => {
        erQueue.heap = [];
        actionStack.length = 0;
        updateUI();
    });

    // Load data from localStorage on initialization
    loadData();
    updateUI();
});
