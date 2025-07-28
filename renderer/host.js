const { desktopCapturer } = require('electron');
const WebSocket = require('ws');
const os = require('os');

// --- WebSocket Server Setup ---
const wss = new WebSocket.Server({ port: 8080 });
let viewerSocket = null;
let streamInterval = null;

wss.on('connection', socket => {
  console.log('Viewer connected');
  viewerSocket = socket;

  startScreenStreaming();

  socket.on('close', () => {
    console.log('Viewer disconnected');
    viewerSocket = null;
    if (streamInterval) {
      clearInterval(streamInterval);
      streamInterval = null;
    }
  });

  // Handle multiple connections - only stream to the latest one
  wss.clients.forEach(client => {
    if (client !== socket && client.readyState === WebSocket.OPEN) {
      client.close();
    }
  });
});

console.log('Host WebSocket server started on port 8080');

// --- IP Address Display ---
function getIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1'; // Fallback
}

window.addEventListener('DOMContentLoaded', () => {
  const ipElement = document.getElementById('ip-address');
  if (ipElement) {
    ipElement.textContent = getIPAddress();
  }
});


// --- Screen Streaming Logic ---
async function startScreenStreaming() {
  if (!viewerSocket) {
    console.log('No viewer connected, stopping stream.');
    return;
  }

  try {
    const sources = await desktopCapturer.getSources({ types: ['screen'] });
    if (sources.length === 0) {
      console.error('No screen sources found.');
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: sources[0].id
        }
      }
    });

    const video = document.createElement('video');
    video.srcObject = stream;

    if (streamInterval) {
      clearInterval(streamInterval);
    }

    video.onloadedmetadata = () => {
      video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');

      // Start sending frames only after video metadata is loaded
      streamInterval = setInterval(() => {
        if (viewerSocket && viewerSocket.readyState === WebSocket.OPEN) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = canvas.toDataURL('image/jpeg', 0.5);
          viewerSocket.send(imageData);
        } else {
          // If socket is closed, stop everything
          clearInterval(streamInterval);
          streamInterval = null;
          stream.getTracks().forEach(track => track.stop());
        }
      }, 100); // ~10 FPS
    };
  } catch (e) {
    console.error('Error starting screen streaming:', e);
  }
}
