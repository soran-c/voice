const { Server } = require("socket.io");
const http = require("http");

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const rooms = {};

io.on("connection", (socket) => {
  socket.on("join", (room) => {
    socket.join(room);
    if (!rooms[room]) rooms[room] = [];
    rooms[room].push(socket.id);

    if (rooms[room].length >= 2) {
      io.to(room).emit("ready");
    }

    socket.on("offer", (data) => socket.to(room).emit("offer", data));
    socket.on("answer", (data) => socket.to(room).emit("answer", data));
    socket.on("candidate", (data) => socket.to(room).emit("candidate", data));

    socket.on("disconnect", () => {
      rooms[room] = rooms[room].filter((id) => id !== socket.id);
    });
  });
});

server.listen(3001, () => {
  console.log("🎤 Signaling server for voice chat on port 3001");
});
