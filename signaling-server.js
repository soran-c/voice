// signaling-server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" } // یا IP / domain تۆ داخڵ بکە
});

const rooms = {};  // room_code => [socketId1, socketId2]

io.on('connection', socket => {
  console.log('User connected:', socket.id);

  socket.on('join', roomCode => {
    socket.join(roomCode);
    if (!rooms[roomCode]) rooms[roomCode] = [];
    rooms[roomCode].push(socket.id);

    console.log(`User ${socket.id} joined room ${roomCode}`);

    // Notify others in room
    const otherClients = rooms[roomCode].filter(id => id !== socket.id);
    if (otherClients.length > 0) {
      socket.emit('ready');
      otherClients.forEach(id => io.to(id).emit('ready'));
    }
  });

  socket.on('offer', (roomCode, offer) => {
    socket.to(roomCode).emit('offer', offer);
  });

  socket.on('answer', (roomCode, answer) => {
    socket.to(roomCode).emit('answer', answer);
  });

  socket.on('candidate', (roomCode, candidate) => {
    socket.to(roomCode).emit('candidate', candidate);
  });

  socket.on('disconnect', () => {
    // Remove socket from rooms
    for (const roomCode in rooms) {
      rooms[roomCode] = rooms[roomCode].filter(id => id !== socket.id);
      if (rooms[roomCode].length === 0) delete rooms[roomCode];
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
});
