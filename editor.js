const videoUpload = document.getElementById('videoUpload');
const sourceVideo = document.getElementById('sourceVideo');
const canvas = document.getElementById('videoCanvas');
const ctx = canvas.getContext('2d');
const overlayText = document.getElementById('overlayText');
const textColor = document.getElementById('textColor');
const exportBtn = document.getElementById('exportBtn');
const statusText = document.getElementById('statusText');

let animationFrameId;

// 1. Load the video when user uploads it
videoUpload.addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;

  const fileURL = URL.createObjectURL(file);
  sourceVideo.src = fileURL;
  
  // Wait for video metadata to load so we know its size
  sourceVideo.onloadedmetadata = () => {
    canvas.width = sourceVideo.videoWidth;
    canvas.height = sourceVideo.videoHeight;
    exportBtn.disabled = false;
    statusText.innerText = "Video loaded. Ready to play/record.";
    drawFrame(); // Draw the first frame
  };
});

// 2. The drawing loop: Draw video frame + Text on top
function drawFrame() {
  if (sourceVideo.paused || sourceVideo.ended) {
    // Just draw a static frame if not playing
    ctx.drawImage(sourceVideo, 0, 0, canvas.width, canvas.height);
  } else {
    // Draw playing video
    ctx.drawImage(sourceVideo, 0, 0, canvas.width, canvas.height);
    animationFrameId = requestAnimationFrame(drawFrame);
  }

  // Draw the custom text overlay
  const text = overlayText.value;
  if (text) {
    ctx.font = 'bold 48px sans-serif';
    ctx.fillStyle = textColor.value;
    ctx.textAlign = 'center';
    
    // Adding a slight black shadow so text is visible on light backgrounds
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 10;
    
    // Draw text in the bottom center
    ctx.fillText(text, canvas.width / 2, canvas.height - 50);
    
    // Reset shadow
    ctx.shadowBlur = 0; 
  }
}

// Redraw if user types or changes color while paused
overlayText.addEventListener('input', drawFrame);
textColor.addEventListener('input', drawFrame);

// 3. The Recording Engine
exportBtn.addEventListener('click', () => {
  statusText.innerText = "🔴 Recording... Please wait.";
  exportBtn.disabled = true;

  // Set up the MediaRecorder to capture the canvas
  const stream = canvas.captureStream(30); // 30 FPS
  const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
  const chunks = [];

  recorder.ondataavailable = e => chunks.push(e.data);
  
  recorder.onstop = () => {
    // Compile the recorded chunks into a file and download it
    const blob = new Blob(chunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'edited-video.webm';
    a.click();
    
    statusText.innerText = "✅ Export Complete!";
    exportBtn.disabled = false;
  };

  // Start the recording process
  recorder.start();
  sourceVideo.currentTime = 0; // Rewind to start
  sourceVideo.play();          // Start playing
  drawFrame();                 // Start the drawing loop

  // Stop recording when the video finishes
  sourceVideo.onended = () => {
    recorder.stop();
    cancelAnimationFrame(animationFrameId);
  };
});
