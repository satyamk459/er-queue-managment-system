// =============================================
//  ER QUEUE - script.js
//  localStorage persistence integrated
// =============================================
 
// ---------- Storage Keys ----------
const STORAGE_KEY      = 'erQueue_patients';
const UNDO_STACK_KEY   = 'erQueue_undoStack';
 
// ---------- Load / Save helpers ----------
function loadQueue() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
}
 
function saveQueue(queue) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}
 
function loadUndoStack() {
    try { return JSON.parse(localStorage.getItem(UNDO_STACK_KEY)) || []; }
    catch { return []; }
}
 
function saveUndoStack(stack) {
    localStorage.setItem(UNDO_STACK_KEY, JSON.stringify(stack));
}
 
// ---------- Min-Heap helpers ----------
function heapInsert(heap, patient) {
    heap.push(patient);
    let i = heap.length - 1;
    while (i > 0) {
        const parent = Math.floor((i - 1) / 2);
        if (heap[parent].triage <= heap[i].triage) break;
        [heap[parent], heap[i]] = [heap[i], heap[parent]];
        i = parent;
    }
}
 
function heapExtract(heap) {
    if (!heap.length) return null;
    const top = heap[0];
    const last = heap.pop();
    if (heap.length > 0) {
        heap[0] = last;
        let i = 0;
        while (true) {
            let smallest = i;
            const l = 2 * i + 1, r = 2 * i + 2;
            if (l < heap.length && heap[l].triage < heap[smallest].triage) smallest = l;
            if (r < heap.length && heap[r].triage < heap[smallest].triage) smallest = r;
            if (smallest === i) break;
            [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
            i = smallest;
        }
    }
    return top;
}
 
// Returns a sorted copy (lowest triage = highest priority first)
function getSortedQueue() {
    return [...loadQueue()].sort((a, b) => a.triage - b.triage || a.timestamp - b.timestamp);
}
 
// ---------- Triage label / badge helpers ----------
const TRIAGE_LABELS = { 1: 'CRITICAL', 2: 'SEVERE', 3: 'MODERATE', 4: 'MINOR' };
const TRIAGE_CLASS  = { 1: 'critical', 2: 'severe',  3: 'moderate',  4: 'minor'  };
 
// ---------- Render queue ----------
function renderQueue() {
    const sorted   = getSortedQueue();
    const listEl   = document.getElementById('queueList');
    const countEl  = document.getElementById('queueCount');
 
    countEl.textContent = `${sorted.length} Patient${sorted.length !== 1 ? 's' : ''} Waiting`;
 
    if (!sorted.length) {
        listEl.innerHTML = `
            <div class="empty-state">
                <i class="ri-inbox-archive-line"></i>
                <p>No patients in the current queue.</p>
            </div>`;
        return;
    }
 
    listEl.innerHTML = sorted.map((p, idx) => `
        <div class="queue-item">
            <div class="queue-rank">${idx + 1}</div>
            <div class="queue-info">
                <div class="queue-name">${esc(p.name)}, ${p.age}y</div>
                <div class="queue-sub">${esc(p.condition)}</div>
            </div>
            <span class="badge-triage ${TRIAGE_CLASS[p.triage]}">${TRIAGE_LABELS[p.triage]}</span>
        </div>
    `).join('');
}
 
// ---------- Admit patient ----------
document.getElementById('admitForm').addEventListener('submit', function (e) {
    e.preventDefault();
 
    const name      = document.getElementById('pName').value.trim();
    const age       = parseInt(document.getElementById('pAge').value);
    const triage    = parseInt(document.getElementById('pTriage').value);
    const condition = document.getElementById('pCondition').value.trim();
 
    if (!name || !age || !condition) return;
 
    const patient = {
        id:        Date.now().toString(),
        name,
        age,
        triage,
        condition,
        timestamp: Date.now()
    };
 
    // Push to heap and save
    const queue = loadQueue();
    heapInsert(queue, patient);
    saveQueue(queue);
 
    // Push to undo stack
    const undoStack = loadUndoStack();
    undoStack.push(patient.id);
    saveUndoStack(undoStack);
 
    // Reset form
    this.reset();
    renderQueue();
});
 
// ---------- Undo last ----------
document.getElementById('btnUndo').addEventListener('click', function () {
    const undoStack = loadUndoStack();
    if (!undoStack.length) return;
 
    const lastId = undoStack.pop();
    saveUndoStack(undoStack);
 
    const queue = loadQueue().filter(p => p.id !== lastId);
    saveQueue(queue);
    renderQueue();
});
 
// ---------- Clear / Reset ----------
document.getElementById('btnClear').addEventListener('click', function () {
    if (!confirm('Reset all patient data? This cannot be undone.')) return;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(UNDO_STACK_KEY);
    renderQueue();
});
 
// ---------- XSS escape ----------
function esc(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
 
// ---------- Init: render saved queue on page load ----------
renderQueue();
 
