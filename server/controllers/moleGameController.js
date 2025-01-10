// server/controllers/moleGameController.js

const MAX_PLAYERS = 8;
const MIN_PLAYERS = 3;
const GAME_DURATION = 20; // 초
const BOARD_SIZE = 3;     // 3x3

// 방 목록 (roomCode -> 방 상태)
const rooms = {};

/**
 * 6자리 방 코드 생성
 */
function generateRoomCode() {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += Math.floor(Math.random() * 10);
  }
  return code;
}

/**
 * 게임 종료 로직
 */
function endGame(io, roomCode) {
  const room = rooms[roomCode];
  if (!room) return;

  clearInterval(room.timerInterval);
  room.gameInProgress = false;
  room.currentMoleIndex = -1;

  const sortedPlayers = Object.entries(room.players)
    .map(([sid, info]) => ({
      socketId: sid,
      nickname: info.nickname,
      score: info.score,
    }))
    .sort((a, b) => b.score - a.score);

  io.to(roomCode).emit('mole:gameEnded', sortedPlayers);
}

/**
 * 현재 플레이어 목록 브로드캐스트
 */
function broadcastPlayerList(io, roomCode) {
  const room = rooms[roomCode];
  if (!room) return;

  const playerList = Object.entries(room.players).map(([sid, info]) => ({
    socketId: sid,
    nickname: info.nickname,
    score: info.score,
  }));
  io.to(roomCode).emit('mole:playerList', playerList);
}

/**
 * 두더지 게임 소켓 로직
 */
function handleMoleGameConnection(socket, io) {
  // 어떤 이벤트든 수신하면 마지막 활동시각 갱신
  socket.onAny((eventName, ...args) => {
    const { roomCode } = socket.data;
    if (roomCode && rooms[roomCode] && rooms[roomCode].players[socket.id]) {
      rooms[roomCode].players[socket.id].lastActivityAt = Date.now();
    }
  });

  /**
   * 방 생성
   */
  socket.on('mole:createRoom', ({ userId, nickname }) => {
    // 1) 방 코드 생성
    const roomCode = generateRoomCode();

    // 2) rooms에 등록
    rooms[roomCode] = {
      hostId: socket.id,
      players: {},
      gameInProgress: false,
      timeLeft: 0,
      timerInterval: null,
      currentMoleIndex: -1,
    };

    // 3) 방장(현재 소켓)도 players에 추가
    rooms[roomCode].players[socket.id] = {
      userId,
      nickname,
      score: 0,
      lastActivityAt: Date.now(),
    };

    // 4) 소켓을 특정 roomCode에 join
    socket.join(roomCode);
    socket.data.roomCode = roomCode;

    // 5) 클라이언트에게 방 코드 전달
    socket.emit('mole:roomCreated', { roomCode });

    // 6) 플레이어 목록 브로드캐스트
    broadcastPlayerList(io, roomCode);
  });

  /**
   * 방 입장
   */
  socket.on('mole:joinRoom', ({ roomCode, userId, nickname }) => {
    if (!rooms[roomCode]) {
      socket.emit('joinError', '존재하지 않는 방 코드입니다.');
      return;
    }
    const room = rooms[roomCode];

    if (Object.keys(room.players).length >= MAX_PLAYERS) {
      socket.emit('joinError', '정원 초과입니다. 최대 8명');
      return;
    }

    // players에 추가
    room.players[socket.id] = {
      userId,
      nickname,
      score: 0,
      lastActivityAt: Date.now(),
    };

    // 소켓 join
    socket.join(roomCode);
    socket.data.roomCode = roomCode;

    // 접속자 목록 업데이트
    broadcastPlayerList(io, roomCode);
  });

  /**
   * 게임 시작
   */
  socket.on('mole:startGame', () => {
    const { roomCode } = socket.data;
    if (!roomCode || !rooms[roomCode]) return;

    const room = rooms[roomCode];

    // 방장만 가능
    if (room.hostId !== socket.id) {
      socket.emit('startGameError', '방장만 게임을 시작할 수 있습니다.');
      return;
    }

    // 이미 게임 중인지 확인
    if (room.gameInProgress) {
      socket.emit('startGameError', '이미 게임이 진행 중입니다.');
      return;
    }

    // 인원 체크
    if (Object.keys(room.players).length < MIN_PLAYERS) {
      socket.emit('startGameError', `최소 ${MIN_PLAYERS}명 이상이어야 시작 가능합니다.`);
      return;
    }

    // 게임 시작
    room.gameInProgress = true;
    room.timeLeft = GAME_DURATION;
    Object.values(room.players).forEach((p) => {
      p.score = 0;
    });

    io.to(roomCode).emit('mole:gameStarted', { timeLeft: room.timeLeft });

    // 타이머 세팅
    room.timerInterval = setInterval(() => {
      room.timeLeft--;
      io.to(roomCode).emit('mole:timeUpdate', room.timeLeft);

      // 1초마다 두더지 위치 갱신
      room.currentMoleIndex = Math.floor(
        Math.random() * (BOARD_SIZE * BOARD_SIZE)
      );
      io.to(roomCode).emit('mole:showMole', room.currentMoleIndex);

      if (room.timeLeft <= 0) {
        endGame(io, roomCode);
      }
    }, 1000);
  });

  /**
   * 두더지 클릭
   */
  socket.on('mole:hitMole', (moleIndex) => {
    const { roomCode } = socket.data;
    if (!roomCode || !rooms[roomCode]) return;

    const room = rooms[roomCode];
    if (!room.gameInProgress) return;

    if (moleIndex === room.currentMoleIndex) {
      room.players[socket.id].score += 1;
      // 이번 두더지 잡힘
      room.currentMoleIndex = -1;
      io.to(roomCode).emit('mole:scoreUpdate', {
        socketId: socket.id,
        score: room.players[socket.id].score,
      });
    }
  });

  /**
   * 연결 해제
   */
  socket.on('disconnect', () => {
    const { roomCode } = socket.data;
    if (!roomCode || !rooms[roomCode]) return;

    const room = rooms[roomCode];
    delete room.players[socket.id];

    // 방에 아무도 없으면 방 삭제
    if (Object.keys(room.players).length === 0) {
      delete rooms[roomCode];
      return;
    }

    // 방장이 나갔으면 새 방장 지정 (첫 번째 인원으로)
    if (room.hostId === socket.id) {
      const remainingPlayers = Object.keys(room.players);
      if (remainingPlayers.length > 0) {
        room.hostId = remainingPlayers[0];
      }
    }

    broadcastPlayerList(io, roomCode);
  });
}

module.exports = {
  handleMoleGameConnection,
  rooms,
  endGame,
};
