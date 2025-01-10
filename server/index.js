// server/index.js
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { handleMoleGameConnection, rooms } = require('./controllers/moleGameController');

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

  // 두더지 게임 소켓 로직
  handleMoleGameConnection(socket, io);

  // (추가 게임: 주사위 등 있으면 여기서 handleDiceGameConnection(socket, io) 등)
});

// 3분 이상 활동 없는 유저 자동 제거
const CLEANUP_INTERVAL = 30 * 1000; // 30초마다
const INACTIVE_THRESHOLD = 3 * 60 * 1000; // 3분

setInterval(() => {
  const now = Date.now();
  Object.keys(rooms).forEach((roomCode) => {
    const room = rooms[roomCode];
    Object.entries(room.players).forEach(([sid, player]) => {
      if (now - player.lastActivityAt > INACTIVE_THRESHOLD) {
        delete room.players[sid];
      }
    });
    // 인원 0명이면 방 삭제
    if (Object.keys(room.players).length === 0) {
      delete rooms[roomCode];
    }
  });
}, CLEANUP_INTERVAL);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
