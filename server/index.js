// server/index.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

// 유저 정보 { socketId: { userId, nickname, hasRolled, diceValue } }
const users = {};

// 현재 게임 상태
let gameInProgress = false;

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // 클라이언트로부터 join 이벤트 받으면 유저 목록에 추가
  socket.on('join', ({ userId, nickname }) => {
    users[socket.id] = {
      userId,
      nickname,
      hasRolled: false,   // 주사위 굴렸는지 여부
      diceValue: 0,       // 주사위 결과
    };

    console.log(`[JOIN] ${nickname} (ID: ${userId}) / socketId: ${socket.id}`);
    broadcastUserList();
  });

  // 클라이언트로부터 startGame 이벤트를 받으면 게임 시작
  socket.on('startGame', () => {
    // 3명 이상이어야 시작 가능
    if (Object.keys(users).length < 3) {
      io.to(socket.id).emit('gameStartError', '3명 이상이 모여야 게임을 시작할 수 있습니다.');
      return;
    }

    // 이미 게임이 진행 중이면 무시
    if (gameInProgress) return;

    // 게임 시작
    gameInProgress = true;
    console.log('Game started!');
    io.emit('gameStarted'); // 모든 클라이언트에게 알림

    // 각 유저 상태 초기화
    Object.values(users).forEach((userData) => {
      userData.hasRolled = false;
      userData.diceValue = 0;
    });

    // 갱신
    broadcastUserList();
  });

  // 클라이언트로부터 rollDice 이벤트를 받으면 주사위 굴리기
  socket.on('rollDice', () => {
    // 게임이 진행중인지 확인
    if (!gameInProgress) {
      io.to(socket.id).emit('rollError', '게임이 아직 시작되지 않았습니다.');
      return;
    }

    // 이미 굴렸는지 확인
    if (users[socket.id]?.hasRolled) {
      io.to(socket.id).emit('rollError', '이미 주사위를 굴렸습니다!');
      return;
    }

    // 주사위 굴리기 (1~6 랜덤)
    const diceValue = Math.floor(Math.random() * 6) + 1;
    users[socket.id].hasRolled = true;
    users[socket.id].diceValue = diceValue;
    console.log(`[ROLL] ${users[socket.id].nickname} -> 주사위: ${diceValue}`);

    // 유저 목록 갱신 브로드캐스트
    broadcastUserList();

    // 모든 유저가 굴렸는지 확인
    checkAllRolled();
  });

  // 소켓 연결 해제 시
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    delete users[socket.id];
    broadcastUserList();
  });
});

// 모든 유저에게 현재 유저 목록 전송
function broadcastUserList() {
  io.emit('userList', Object.values(users));
}

// 모든 유저가 굴렸는지 확인 & 승자 선정
function checkAllRolled() {
  const allRolled = Object.values(users).every((u) => u.hasRolled === true);
  if (!allRolled) return;

  // 모두 굴렸다면 승자 선정
  const sorted = Object.values(users).sort((a, b) => b.diceValue - a.diceValue);
  const highest = sorted[0].diceValue;
  const winners = sorted.filter((u) => u.diceValue === highest);

  // 다수 우승(동점) 가능
  const winnerNicknames = winners.map((w) => w.nickname);

  // 게임 종료 처리
  gameInProgress = false;

  console.log(`승자: ${winnerNicknames.join(', ')} (주사위: ${highest})`);
  io.emit('gameResult', {
    winnerNicknames,
    diceValue: highest,
  });
}

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
