// ==========================================
// 1. GLOBAL STATE & DOM ELEMENTS
// ==========================================
const editorBody = document.getElementById('editorBody');
const entryTitle = document.getElementById('entryTitle');
const entriesList = document.getElementById('entriesList');

// Database State
let entries = JSON.parse(localStorage.getItem('miniNotionEntries')) || [
  { id: Date.now().toString(), title: "Untitled Entry", content: "<p>Start typing your ideas here...</p>" }
];
let currentEntryId = entries[0].id;

// History State (Undo / Redo)
let historyStack = [];
let historyIndex = -1;
let isNavigatingHistory = false;

// ==========================================
// 2. THEME ENGINE (Light / Dark Mode)
// ==========================================
const themeToggle = document.getElementById('themeToggle');
let currentTheme = localStorage.getItem('miniNotionTheme') || 'light';
document.documentElement.setAttribute('data-theme', currentTheme);
updateThemeIcon();

themeToggle.addEventListener('click', () => {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);
  localStorage.setItem('miniNotionTheme', currentTheme);
  updateThemeIcon();
});

function updateThemeIcon() {
  themeToggle.innerText = currentTheme === 'light' ? '🌙' : '☀️';
}

// ==========================================
// 3. DATABASE & SIDEBAR LOGIC
// ==========================================
function saveToDatabase() {
  const entryIndex = entries.findIndex(e => e.id === currentEntryId);
  if (entryIndex !== -1) {
    entries[entryIndex].title = entryTitle.value;
    entries[entryIndex].content = editorBody.innerHTML;
    localStorage.setItem('miniNotionEntries', JSON.stringify(entries));
  }
}

function renderSidebar() {
  entriesList.innerHTML = ''; 
  entries.forEach(entry => {
    const li = document.createElement('li');
    li.className = `entry-item ${entry.id === currentEntryId ? 'active' : ''}`;
    li.innerText = `📝 ${entry.title || "Untitled"}`;
    li.onclick = () => loadEntry(entry.id);
    entriesList.appendChild(li);
  });
}

function loadEntry(id) {
  saveToDatabase(); // Save current before switching
  currentEntryId = id;
  const entry = entries.find(e => e.id === id);
  
  entryTitle.value = entry.title;
  editorBody.innerHTML = entry.content;
  
  // Reset history for new page
  historyStack = [];
  historyIndex = -1;
  saveHistoryState(); 
  
  renderSidebar();
}

document.getElementById('newEntryBtn').addEventListener('click', () => {
  const newEntry = {
    id: Date.now().toString(),
    title: "",
    content: "<p><br></p>"
  };
  entries.unshift(newEntry);
  saveToDatabase();
  loadEntry(newEntry.id);
  entryTitle.focus();
});

document.getElementById('saveBtn').addEventListener('click', (e) => {
  saveToDatabase();
  const btn = e.target;
  const originalText = btn.innerText;
  btn.innerText = "✅ Saved!";
  setTimeout(() => btn.innerText = originalText, 2000);
});

// Update title dynamically in sidebar
entryTitle.addEventListener('input', renderSidebar);

// ==========================================
// 4. UNDO / REDO ENGINE
// ==========================================
function saveHistoryState() {
  if (isNavigatingHistory) return;
  
  const currentState = editorBody.innerHTML;
  // Don't save if it's the exact same as the last state
  if (historyIndex >= 0 && historyStack[historyIndex] === currentState) return;

  // If we undo'd and then typed, delete the "future" history
  if (historyIndex < historyStack.length - 1) {
    historyStack = historyStack.slice(0, historyIndex + 1);
  }

  historyStack.push(currentState);
  historyIndex++;
}

document.getElementById('undoBtn').addEventListener('click', () => {
  if (historyIndex > 0) {
    isNavigatingHistory = true;
    historyIndex--;
    editorBody.innerHTML = historyStack[historyIndex];
    isNavigatingHistory = false;
  }
});

document.getElementById('redoBtn').addEventListener('click', () => {
  if (historyIndex < historyStack.length - 1) {
    isNavigatingHistory = true;
    historyIndex++;
    editorBody.innerHTML = historyStack[historyIndex];
    isNavigatingHistory = false;
  }
});

// Save history on typing (debounced slightly)
editorBody.addEventListener('input', () => {
  clearTimeout(editorBody.historyTimeout);
  editorBody.historyTimeout = setTimeout(saveHistoryState, 400);
});


// ==========================================
// 5. EDITOR BUG FIX & FORMATTING
// ==========================================
// Prevent toolbar clicks from stealing cursor focus
const allToolbarButtons = document.querySelectorAll('.tool-btn, .custom-btn, .tool-select, input[type="color"]');
allToolbarButtons.forEach(el => {
  el.addEventListener('mousedown', (e) => e.preventDefault());
});

// Core Buttons
document.querySelectorAll('.format-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const command = btn.getAttribute('data-command');
    const value = btn.getAttribute('data-value') || null;
    document.execCommand(command, false, value);
    saveHistoryState();
  });
});

// Typography & Colors
document.getElementById('fontFamily').addEventListener('change', (e) => {
  document.execCommand('fontName', false, e.target.value);
  saveHistoryState();
});

document.getElementById('fontSize').addEventListener('change', (e) => {
  document.execCommand('fontSize', false, e.target.value);
  saveHistoryState();
});

document.getElementById('textColor').addEventListener('input', (e) => {
  document.execCommand('foreColor', false, e.target.value);
});

document.getElementById('highlightColor').addEventListener('input', (e) => {
  document.execCommand('hiliteColor', false, e.target.value); 
  document.execCommand('backColor', false, e.target.value); 
});

// Toggle List (Notion Style)
document.getElementById('insertToggleBtn').addEventListener('click', () => {
  const toggleHTML = `<details><summary>Toggle Title</summary><div>Type here...</div></details><p><br></p>`;
  document.execCommand('insertHTML', false, toggleHTML);
  saveHistoryState();
});


// ==========================================
// 6. EMOJIS & MEDIA
// ==========================================
const emojiGrid = document.getElementById('emojiGrid');
const emojis = ['😀','😂','🥰','😎','🤔','😭','😡','🤯','🥳','😴','🚀','⭐','🔥','✅','❌','📌','💡','💻','📈','🎨'];

emojis.forEach(emoji => {
  const span = document.createElement('span');
  span.className = 'emoji-item';
  span.innerText = emoji;
  span.addEventListener('click', () => {
    document.execCommand('insertText', false, emoji);
    saveHistoryState();
  });
  emojiGrid.appendChild(span);
});

// Image Upload & Gallery Wrappers
document.getElementById('imageUpload').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    const imgUrl = event.target.result;
    // We wrap the image in our custom HTML to allow resizing and side-by-side galleries
    const imgHTML = `
      <div class="resizable-img-wrapper" style="width: 50%;">
        <img src="${imgUrl}" alt="Uploaded Image">
        <div class="resize-handle" contenteditable="false"></div>
      </div>&nbsp;
    `;
    document.execCommand('insertHTML', false, imgHTML);
    saveHistoryState();
  };
  reader.readAsDataURL(file);
});


// ==========================================
// 7. IMAGE RESIZING ENGINE
// ==========================================
let isResizing = false;
let currentImageWrapper = null;
let startX;
let startWidth;

editorBody.addEventListener('mousedown', (e) => {
  if (e.target.classList.contains('resize-handle')) {
    isResizing = true;
    currentImageWrapper = e.target.parentElement;
    startX = e.clientX;
    startWidth = currentImageWrapper.offsetWidth;
    e.preventDefault(); // Stop text selection
  }
});

document.addEventListener('mousemove', (e) => {
  if (!isResizing || !currentImageWrapper) return;
  const newWidth = startWidth + (e.clientX - startX);
  // Convert to percentage so it stays responsive
  const parentWidth = editorBody.offsetWidth;
  const percentage = (newWidth / parentWidth) * 100;
  
  if (percentage > 10 && percentage <= 100) {
    currentImageWrapper.style.width = `${percentage}%`;
  }
});

document.addEventListener('mouseup', () => {
  if (isResizing) {
    isResizing = false;
    currentImageWrapper = null;
    saveHistoryState();
  }
});


// ==========================================
// 8. EXPORT PDF
// ==========================================
document.getElementById('exportPdfBtn').addEventListener('click', () => {
  const btn = document.getElementById('exportPdfBtn');
  const originalText = btn.innerText;
  btn.innerText = '⏳...';
  
  const element = document.getElementById('pdfExportWrapper');
  const safeTitle = entryTitle.value.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'entry';

  const opt = {
    margin:       15,
    filename:     `Notes_${safeTitle}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true }, 
    jsPDF:        { unit: 'mm', format: 'letter', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save().then(() => {
    btn.innerText = originalText;
  });
});

// Boot up
renderSidebar();
loadEntry(currentEntryId);
