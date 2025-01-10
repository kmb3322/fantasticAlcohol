// server/index.js
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { handleMoleGameConnection } = require('./controllers/moleGameController');

const PORT = 4000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

// 소켓 연결
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // 두더지 게임 소켓 로직 연결
  handleMoleGameConnection(socket, io);

  // 추후 다른 게임 로직도 유사하게 연결
  // handleDiceGameConnection(socket, io);
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
