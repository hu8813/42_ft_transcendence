const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  socket.on('message', (message) => {
    console.log('Message received:', message);
    io.emit('message', message);
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Socket.IO server running on port ${PORT}`));

