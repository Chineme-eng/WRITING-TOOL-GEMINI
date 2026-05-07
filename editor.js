// ==========================================
// 1. SELECT DOM ELEMENTS
// ==========================================
const videoUpload = document.getElementById('videoUpload');
const mediaList = document.getElementById('mediaList');
const canvas = document.getElementById('previewCanvas');
const ctx = canvas.getContext('2d');
const playBtn = document.getElementById('playBtn');
const timeDisplay = document.getElementById('timeDisplay');
const playhead = document.getElementById('playhead');
const exportBtn = document.getElementById('exportBtn');
const canvasText = document.getElementById('canvasText');

// ==========================================
// 2. GLOBAL STATE
// ==========================================
let isPlaying = false;
let animationId;
let sourceVideo = document.createElement('video'); // Hidden video player
let currentTimelineTime = 0; // In seconds
const timelineMaxSeconds = 30; // 30-second timeline for MVP
const timelineWidthPixels = 800; // Estimated width of tracks area

// ==========================================
// 3. IMPORT MEDIA LOGIC
// ==========================================
videoUpload.addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;

  const fileURL = URL.createObjectURL(file);
  sourceVideo.src = fileURL;
  sourceVideo.crossOrigin = "anonymous";

  // Update Media Pool UI
  mediaList.innerHTML = `<div style="padding: 10px; background: #222; border-radius: 4px; font-size: 0.8rem; border-left: 3px solid #3b82f6;">🎬 ${file.name}</div>`;
  
  // Hide placeholder text and set canvas size
  sourceVideo.onloadedmetadata = () => {
    canvasText.style.display = 'none';
    // Scale canvas to fit maintaining aspect ratio (720p base)
    canvas.width = 1280;
    canvas.height = 720;
    drawFrame(); // Draw the very first frame
  };
});

// ==========================================
// 4. THE PLAYBACK & CANVAS ENGINE
// ==========================================
function drawFrame() {
  // Clear canvas
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw the video if it's ready
  if (sourceVideo.readyState >= 2) {
    ctx.drawImage(sourceVideo, 0, 0, canvas.width, canvas.height);
  }

  // Update time display (00:00)
  const formatTime = (time) => new Date(time * 1000).toISOString().substring(14, 19);
  timeDisplay.innerText = `${formatTime(sourceVideo.currentTime)} / ${formatTime(sourceVideo.duration || 0)}`;

  // Move the playhead visually
  if (sourceVideo.duration) {
    const progress = sourceVideo.currentTime / sourceVideo.duration;
    // Move playhead across the screen
    playhead.style.left = `${progress * 100}%`;
  }

  if (isPlaying) {
    animationId = requestAnimationFrame(drawFrame);
  }
}

playBtn.addEventListener('click', () => {
  if (!sourceVideo.src) {
    alert("Please import a video first!");
    return;
  }

  isPlaying = !isPlaying;
  
  if (isPlaying) {
    playBtn.innerText = '⏸ Pause';
    sourceVideo.play();
    drawFrame(); // Start the loop
  } else {
    playBtn.innerText = '▶ Play';
    sourceVideo.pause();
    cancelAnimationFrame(animationId);
  }
});

// ==========================================
// 5. TIMELINE CLIP DRAGGING (UI FEEL)
// ==========================================
// This makes the placeholder blocks draggable left and right
const clips = document.querySelectorAll('.clip');

clips.forEach(clip => {
  let isDragging = false;
  let startX;
  let startLeft;

  clip.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    startLeft = parseInt(window.getComputedStyle(clip).left, 10) || 0;
    clip.style.cursor = 'grabbing';
    clip.style.zIndex = 100;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    clip.style.left = `${startLeft + dx}px`;
  });

  window.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      clip.style.cursor = 'grab';
      clip.style.zIndex = 1;
    }
  });
});

// ==========================================
// 6. EXPORT / RENDER ENGINE
// ==========================================
exportBtn.addEventListener('click', () => {
  if (!sourceVideo.src) return alert("Nothing to export!");

  exportBtn.innerText = "🔴 Exporting...";
  exportBtn.style.backgroundColor = "#dc2626"; // Turn red

  // Create a MediaRecorder to capture the Canvas stream at 30fps
  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
  const chunks = [];

  recorder.ondataavailable = e => chunks.push(e.data);
  
  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'My_NLE_Export.webm';
    a.click(); // Trigger download
    
    // Reset UI
    exportBtn.innerText = "Export MP4";
    exportBtn.style.backgroundColor = "#059669";
  };

  // Rewind and play to record
  sourceVideo.currentTime = 0;
  sourceVideo.play();
  isPlaying = true;
  drawFrame();
  recorder.start();

  // Stop recording when the video ends
  sourceVideo.onended = () => {
    recorder.stop();
    sourceVideo.pause();
    isPlaying = false;
    playBtn.innerText = '▶ Play';
  };
});
