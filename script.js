// =============================================
// LOGIN SYSTEM — Authentication & Session
// =============================================

// Default built-in credentials (always available)
const DEFAULT_CREDENTIALS = {
    doctor: [
        { userId: 'doc01', password: 'clinical123', name: 'Dr. Admin' },
        { userId: 'doc02', password: 'doctor456', name: 'Dr. Specialist' },
    ],
    crew: [
        { userId: 'crew01', password: 'triage456', name: 'Nurse Station' },
        { userId: 'crew02', password: 'crew789', name: 'Paramedic Unit' },
    ]
};

// Firebase ref for registered users (loaded after Firebase init)
let usersRef = null;
let firebaseUsers = { doctor: [], crew: [] };

function initUsersRef() {
    if (typeof firebase !== 'undefined' && firebase.database) {
        usersRef = firebase.database().ref('erqueue/users');
        // Listen for registered users in real-time
        usersRef.on('value', (snapshot) => {
            const data = snapshot.val();
            firebaseUsers = { doctor: [], crew: [] };
            if (data) {
                Object.values(data).forEach(u => {
                    if (firebaseUsers[u.role]) {
                        firebaseUsers[u.role].push(u);
                    }
                });
            }
        });
    }
}

// --- Floating Particles ---
function createParticles() {
    const container = document.getElementById('loginParticles');
    if (!container) return;
    const colors = ['rgba(218,49,57,0.35)', 'rgba(99,102,241,0.25)', 'rgba(139,92,246,0.2)', 'rgba(255,255,255,0.08)'];
    for (let i = 0; i < 30; i++) {
        const p = document.createElement('div');
        p.className = 'login-particle';
        const size = Math.random() * 6 + 2;
        p.style.width = size + 'px';
        p.style.height = size + 'px';
        p.style.left = Math.random() * 100 + '%';
        p.style.background = colors[Math.floor(Math.random() * colors.length)];
        p.style.animationDuration = (Math.random() * 12 + 8) + 's';
        p.style.animationDelay = (Math.random() * 10) + 's';
        container.appendChild(p);
    }
}

// --- Password Toggle ---
function setupPasswordToggle() {
    const toggle = document.getElementById('togglePassword');
    const input = document.getElementById('loginPassword');
    const icon = document.getElementById('eyeIcon');
    if (!toggle) return;
    toggle.addEventListener('click', () => {
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        icon.className = isPassword ? 'ri-eye-line' : 'ri-eye-off-line';
    });
}

// --- Auth Tab Switching ---
function setupAuthTabs() {
    const tabs = document.querySelectorAll('.auth-tab');
    const panels = document.querySelectorAll('.auth-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            // Switch active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            // Switch active panel
            panels.forEach(p => {
                p.classList.remove('active');
                if (p.dataset.panel === target) p.classList.add('active');
            });
            // Clear messages
            const loginErr = document.getElementById('loginError');
            const regMsg = document.getElementById('registerMsg');
            if (loginErr) loginErr.style.display = 'none';
            if (regMsg) regMsg.style.display = 'none';
        });
    });
}

// --- Login Handler ---
function setupLogin() {
    const form = document.getElementById('loginForm');
    const errorBox = document.getElementById('loginError');
    const errorText = document.getElementById('loginErrorText');
    const loginBtn = document.getElementById('loginBtn');
    const overlay = document.getElementById('loginOverlay');
    const appWrapper = document.getElementById('appWrapper');

    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        errorBox.style.display = 'none';

        const role = document.querySelector('input[name="role"]:checked').value;
        const userId = document.getElementById('loginUserId').value.trim();
        const password = document.getElementById('loginPassword').value;

        // Show loader
        loginBtn.querySelector('.login-btn-text').style.display = 'none';
        loginBtn.querySelector('.login-btn-loader').style.display = 'inline-flex';
        loginBtn.disabled = true;

        setTimeout(() => {
            // Check default credentials first, then Firebase users
            const defaults = DEFAULT_CREDENTIALS[role] || [];
            const fbUsers = firebaseUsers[role] || [];
            const allUsers = [...defaults, ...fbUsers];
            const match = allUsers.find(u => u.userId === userId && u.password === password);

            if (match) {
                sessionStorage.setItem('erqueue_auth', JSON.stringify({
                    role: role,
                    userId: match.userId,
                    name: match.name,
                    loggedInAt: Date.now()
                }));

                overlay.classList.add('hidden');
                setTimeout(() => {
                    overlay.style.display = 'none';
                    appWrapper.style.display = 'block';
                    updateUserBadge(role, match.name);
                }, 600);
            } else {
                errorText.textContent = 'Invalid User ID or Password. Please try again.';
                errorBox.style.display = 'flex';
                errorBox.style.animation = 'none';
                errorBox.offsetHeight;
                errorBox.style.animation = '';

                loginBtn.querySelector('.login-btn-text').style.display = 'inline';
                loginBtn.querySelector('.login-btn-loader').style.display = 'none';
                loginBtn.disabled = false;
            }
        }, 800);
    });
}

// --- Register Handler ---
function setupRegister() {
    const form = document.getElementById('registerForm');
    if (!form) return;

    const msgBox = document.getElementById('registerMsg');
    const msgText = document.getElementById('registerMsgText');
    const msgIcon = document.getElementById('regMsgIcon');
    const regBtn = document.getElementById('registerBtn');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        msgBox.style.display = 'none';
        msgBox.classList.remove('success');

        const role = document.querySelector('input[name="regRole"]:checked').value;
        const name = document.getElementById('regName').value.trim();
        const userId = document.getElementById('regUserId').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirm = document.getElementById('regConfirm').value;

        // Validation
        if (password !== confirm) {
            showRegMsg('Passwords do not match.', false);
            return;
        }
        if (userId.length < 3) {
            showRegMsg('User ID must be at least 3 characters.', false);
            return;
        }

        // Check if userId already exists
        const defaults = DEFAULT_CREDENTIALS[role] || [];
        const fbUsers = firebaseUsers[role] || [];
        const allUsers = [...defaults, ...fbUsers];
        if (allUsers.find(u => u.userId === userId)) {
            showRegMsg('This User ID is already taken. Try another.', false);
            return;
        }

        // Show loader
        regBtn.querySelector('.login-btn-text').style.display = 'none';
        regBtn.querySelector('.login-btn-loader').style.display = 'inline-flex';
        regBtn.disabled = true;

        // Save to Firebase
        const newUserRef = usersRef.push();
        newUserRef.set({
            role: role,
            userId: userId,
            password: password,
            name: name,
            createdAt: Date.now()
        }).then(() => {
            showRegMsg('Account created! You can now Sign In.', true);
            form.reset();
            // Auto-switch to Sign In tab after 1.5s
            setTimeout(() => {
                document.getElementById('tabSignIn').click();
                // Pre-fill the userId
                document.getElementById('loginUserId').value = userId;
                document.getElementById('loginPassword').focus();
            }, 1500);
        }).catch((err) => {
            showRegMsg('Registration failed: ' + err.message, false);
        }).finally(() => {
            regBtn.querySelector('.login-btn-text').style.display = 'inline';
            regBtn.querySelector('.login-btn-loader').style.display = 'none';
            regBtn.disabled = false;
        });
    });

    function showRegMsg(text, isSuccess) {
        msgText.textContent = text;
        msgBox.style.display = 'flex';
        msgBox.classList.toggle('success', isSuccess);
        msgIcon.className = isSuccess ? 'ri-check-line' : 'ri-error-warning-line';
        msgBox.style.animation = 'none';
        msgBox.offsetHeight;
        msgBox.style.animation = '';
    }
}

// --- Update Header Badge ---
function updateUserBadge(role, name) {
    const badge = document.getElementById('userBadge');
    const label = document.getElementById('userRoleLabel');
    if (badge && label) {
        label.textContent = role === 'doctor' ? '🩺 Doctor' : '🏥 Crew';
        badge.style.display = 'inline-flex';
        badge.title = name;
    }
}

// --- Logout Handler ---
function setupLogout() {
    const btn = document.getElementById('btnLogout');
    if (!btn) return;
    btn.addEventListener('click', () => {
        sessionStorage.removeItem('erqueue_auth');
        window.location.reload();
    });
}

// --- Check Existing Session ---
function checkSession() {
    const session = sessionStorage.getItem('erqueue_auth');
    if (session) {
        try {
            const data = JSON.parse(session);
            const overlay = document.getElementById('loginOverlay');
            const appWrapper = document.getElementById('appWrapper');
            overlay.style.display = 'none';
            appWrapper.style.display = 'block';
            updateUserBadge(data.role, data.name);
            return true;
        } catch (e) {
            sessionStorage.removeItem('erqueue_auth');
        }
    }
    return false;
}

// --- Initialize Login System ---
document.addEventListener('DOMContentLoaded', () => {
    // Init Firebase users ref (Firebase is loaded before script.js)
    initUsersRef();

    if (!checkSession()) {
        createParticles();
        setupPasswordToggle();
    }
    setupAuthTabs();
    setupLogin();
    setupRegister();
    setupLogout();
});

// =============================================
// ER QUEUE APPLICATION
// =============================================

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
