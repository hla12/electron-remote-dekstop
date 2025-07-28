// ws-client.js
const WebSocket = require('ws');

const socket = new WebSocket('ws://127.0.0.1:8080'); // Replace <SERVER_IP> with actual IP

socket.on('open', () => {
  console.log('Connected to server');

  // Send a test message
  socket.send('Hello from client!');
});

socket.on('message', message => {
  console.log('Received:', message.toString());
});

socket.on('close', () => {
  console.log('Disconnected from server');
});
