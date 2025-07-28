const WebSocket = require('ws');

const screenImg = document.getElementById('screen');
const ipInput = document.getElementById('host-ip');
const connectBtn = document.getElementById('connect-btn');
const statusDiv = document.getElementById('status');

let socket = null;

function connect() {
  const hostIp = ipInput.value.trim();
  if (!hostIp) {
    statusDiv.textContent = 'Please enter the Host IP address.';
    return;
  }

  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
      socket.close();
  }

  statusDiv.textContent = `Connecting to ${hostIp}...`;
  socket = new WebSocket(`ws://${hostIp}:8080`);

  socket.on('open', () => {
    console.log('Connected to host');
    statusDiv.textContent = `Connected to ${hostIp}`;
  });

  socket.on('message', data => {
    screenImg.src = data.toString();
  });

  socket.on('close', () => {
    console.log('Disconnected from host');
    statusDiv.textContent = 'Disconnected. Enter Host IP and connect.';
    screenImg.src = '';
  });

  socket.on('error', (err) => {
    console.error('WebSocket error:', err.message);
    statusDiv.textContent = `Error: ${err.message}`;
    screenImg.src = '';
  });
}

connectBtn.addEventListener('click', connect);

ipInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    connect();
  }
});
