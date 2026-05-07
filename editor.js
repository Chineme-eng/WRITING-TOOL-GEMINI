// 1. Text Formatting (Bold, Italic, Underline, Highlight)
const toolBtns = document.querySelectorAll('.tool-btn[data-command]');

toolBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const command = btn.getAttribute('data-command');
    
    if (command === 'hiliteColor') {
      // Highlight requires a color value
      document.execCommand('hiliteColor', false, '#fef08a'); // Soft yellow
    } else {
      document.execCommand(command, false, null);
    }
  });
});

// 2. Setup Emoji Grid
const emojiGrid = document.getElementById('emojiGrid');
const emojis = ['🔥', '💡', '✅', '❌', '🚀', '🧠', '📌', '⭐', '👀', '🎯'];

emojis.forEach(emoji => {
  const span = document.createElement('span');
  span.className = 'emoji-item';
  span.innerText = emoji;
  span.addEventListener('click', () => {
    // Insert emoji at current cursor position
    document.execCommand('insertText', false, emoji);
  });
  emojiGrid.appendChild(span);
});

// 3. Image Upload Logic
const imageUpload = document.getElementById('imageUpload');

imageUpload.addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    const imgUrl = event.target.result;
    // Inserts the image where the cursor is currently placed
    document.execCommand('insertImage', false, imgUrl);
  };
  reader.readAsDataURL(file);
});

// 4. Save to PDF Logic
const exportPdfBtn = document.getElementById('exportPdfBtn');
const editor = document.getElementById('editor');

exportPdfBtn.addEventListener('click', () => {
  // Give visual feedback
  const originalText = exportPdfBtn.innerText;
  exportPdfBtn.innerText = '⏳ Generating...';
  
  // PDF Configuration
  const opt = {
    margin:       10,
    filename:     'My_Creator_Notes.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 }, // Higher resolution
    jsPDF:        { unit: 'mm', format: 'letter', orientation: 'portrait' }
  };

  // Convert the "paper" div into a PDF and download it
  html2pdf().set(opt).from(editor).save().then(() => {
    exportPdfBtn.innerText = originalText;
  });
});
