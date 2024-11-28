const socketIo = require('socket.io');
let io;  // Declare io without initialization

function initSocket(server) {
  io = socketIo(server, {
    cors: {
      origin: "*",
      credentials: true,
      defaultErrorHandler: false,
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  io.on('connection', (socket) => {
    // console.log('A user connected');

    // Example event for testing
    socket.on('test', (data) => {
      console.log('Received test data:', data);
    });

    socket.on('disconnect', () => {
      // console.log('A user disconnected');
    });
  });
  return io;
}

function getSocketIo() {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
}

module.exports = { initSocket, getSocketIo };