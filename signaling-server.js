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

io.on("connection", socket => {
  socket.on("join", room => {
    socket.join(room);
    if (!rooms[room]) rooms[room] = [];
    rooms[room].push(socket.id);
    if (rooms[room].length >= 2) {
      io.to(room).emit("ready");
    }

    socket.on("offer", d => socket.to(room).emit("offer", d));
    socket.on("answer", d => socket.to(room).emit("answer", d));
    socket.on("candidate", d => socket.to(room).emit("candidate", d));

    socket.on("disconnect", () => {
      rooms[room] = rooms[room].filter(id => id !== socket.id);
    });
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log("✅ Voice signaling server running");
});
