// ==========================================
// 1. STATE MANAGEMENT (Local Storage Database)
// ==========================================
let entries = JSON.parse(localStorage.getItem('miniNotionEntries')) || [
  { id: Date.now().toString(), title: "Untitled Entry", content: "<p>Start typing your ideas here...</p>" }
];
let currentEntryId = entries[0].id;

// DOM Elements
const entriesList = document.getElementById('entriesList');
const newEntryBtn = document.getElementById('newEntryBtn');
const entryTitle = document.getElementById('entryTitle');
const editorBody = document.getElementById('editorBody');

// ==========================================
// 2. SIDEBAR & NAVIGATION LOGIC
// ==========================================
function saveToDatabase() {
  localStorage.setItem('miniNotionEntries', JSON.stringify(entries));
}

function renderSidebar() {
  entriesList.innerHTML = ''; // Clear list
  entries.forEach(entry => {
    const li = document.createElement('li');
    li.className = `entry-item ${entry.id === currentEntryId ? 'active' : ''}`;
    li.innerText = `📝 ${entry.title || "Untitled"}`;
    li.onclick = () => loadEntry(entry.id);
    entriesList.appendChild(li);
  });
}

function loadEntry(id) {
  // Save current work before switching
  saveCurrentWork(); 
  
  currentEntryId = id;
  const entry = entries.find(e => e.id === id);
  
  // Load data into workspace
  entryTitle.value = entry.title;
  editorBody.innerHTML = entry.content;
  
  renderSidebar(); // Update active highlight
}

function saveCurrentWork() {
  const entryIndex = entries.findIndex(e => e.id === currentEntryId);
  if (entryIndex !== -1) {
    entries[entryIndex].title = entryTitle.value;
    entries[entryIndex].content = editorBody.innerHTML;
    saveToDatabase();
  }
}

function createNewEntry() {
  const newEntry = {
    id: Date.now().toString(),
    title: "New Entry",
    content: "<p>Start writing here...</p>"
  };
  entries.unshift(newEntry); // Add to top of list
  saveToDatabase();
  loadEntry(newEntry.id);
}

// Auto-save when typing
entryTitle.addEventListener('input', () => {
  saveCurrentWork();
  renderSidebar(); // Update title in sidebar immediately
});
editorBody.addEventListener('input', saveCurrentWork);
newEntryBtn.addEventListener('click', createNewEntry);

// Initial Load
renderSidebar();
loadEntry(currentEntryId);


// ==========================================
// 3. CURSOR & FOCUS MANAGEMENT (The Bug Fix)
// ==========================================
// This stops buttons from stealing your cursor focus when you click them
const allToolbarButtons = document.querySelectorAll('.tool-btn, .custom-btn, .tool-select, input[type="color"]');
allToolbarButtons.forEach(el => {
  el.addEventListener('mousedown', (e) => {
    e.preventDefault(); // Prevents the editor from losing focus!
  });
});


// ==========================================
// 4. TEXT FORMATTING ENGINE
// ==========================================
const formatBtns = document.querySelectorAll('.format-btn');
formatBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const command = btn.getAttribute('data-command');
    const value = btn.getAttribute('data-value') || null;
    document.execCommand(command, false, value);
    editorBody.focus();
  });
});

// Fonts & Sizes
document.getElementById('fontFamily').addEventListener('change', (e) => {
  document.execCommand('fontName', false, e.target.value);
});

document.getElementById('fontSize').addEventListener('change', (e) => {
  document.execCommand('fontSize', false, e.target.value);
});

// Colors
document.getElementById('textColor').addEventListener('input', (e) => {
  document.execCommand('foreColor', false, e.target.value);
});

document.getElementById('highlightColor').addEventListener('input', (e) => {
  // 'hiliteColor' works in most browsers, 'backColor' is a fallback
  document.execCommand('hiliteColor', false, e.target.value); 
  document.execCommand('backColor', false, e.target.value); 
});


// ==========================================
// 5. RICH MEDIA (Emojis, Images, Toggles)
// ==========================================

// Emojis
const emojiItems = document.querySelectorAll('.emoji-item');
emojiItems.forEach(emoji => {
  emoji.addEventListener('click', (e) => {
    document.execCommand('insertText', false, e.target.innerText);
  });
});

// Images
const imageUpload = document.getElementById('imageUpload');
imageUpload.addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    const imgUrl = event.target.result;
    document.execCommand('insertImage', false, imgUrl);
    saveCurrentWork(); // Auto-save after inserting huge image data
  };
  reader.readAsDataURL(file);
});

// Custom Toggle List (Notion Style)
document.getElementById('insertToggleBtn').addEventListener('click', () => {
  const toggleHTML = `
    <details>
      <summary>Toggle Title (Click to rename)</summary>
      <div>Type hidden content here...</div>
    </details><p><br></p>
  `;
  document.execCommand('insertHTML', false, toggleHTML);
});


// ==========================================
// 6. PDF EXPORT ENGINE
// ==========================================
const exportPdfBtn = document.getElementById('exportPdfBtn');

exportPdfBtn.addEventListener('click', () => {
  const originalText = exportPdfBtn.innerText;
  exportPdfBtn.innerText = '⏳ Exporting...';
  
  // Target the wrapper that holds both Title and Body
  const element = document.getElementById('pdfExportWrapper');
  const safeTitle = entryTitle.value.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'entry';

  const opt = {
    margin:       [15, 15, 15, 15],
    filename:     `MiniNotion_${safeTitle}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true }, 
    jsPDF:        { unit: 'mm', format: 'letter', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save().then(() => {
    exportPdfBtn.innerText = originalText;
  });
});
