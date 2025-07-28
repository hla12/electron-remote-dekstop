// ws-server.js
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

console.log("WebSocket server started on ws://localhost:8080");

wss.on('connection', socket => {
  console.log('Client connected');

  socket.on('message', message => {
    console.log('Received:', message.toString());
    
    // Echo back
    socket.send(`Server received: ${message}`);
  });

  socket.on('close', () => {
    console.log('Client disconnected');
  });
});
