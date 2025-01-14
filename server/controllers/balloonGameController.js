// controllers/balloonGameController.js
const MAX_PLAYERS = 8;
const MIN_PLAYERS = 2;
const GAME_DURATION = 20; // 초

// 방 목록 (roomCode -> 방 상태)
const rooms = {};

// socket.id -> userId 매핑 관리
const socketToUserMap = {};

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
  
    const players = Object.values(room.players);
  
    // 풍선이 터지지 않은 참가자와 터진 참가자 분리
    const nonPopped = players.filter(p => !p.popped);
    const popped = players.filter(p => p.popped);
  
    // 풍선이 터지지 않은 참가자: 크기 내림차순 정렬
    nonPopped.sort((a, b) => b.balloonSize - a.balloonSize);
  
    // 풍선 터진 참가자: popTime 내림차순 (나중에 터진 순) 정렬
    popped.sort((a, b) => b.popTime - a.popTime);
  
    // 터진 참가자의 오름차순 popTime (일찍 터진 순) 정렬하여 순서 매핑 생성
    const poppedSortedAsc = [...popped].sort((a, b) => a.popTime - b.popTime);
    const popOrderMap = {};
    poppedSortedAsc.forEach((p, idx) => {
      popOrderMap[p.userId] = idx + 1; // 1번째로 터진 경우: 1, 2번째로 터진 경우: 2, ...
    });
  
    // 정렬된 참가자 목록 생성 및 popOrder 추가
    const sortedPlayers = [];
    nonPopped.forEach(p => {
      sortedPlayers.push({
        socketId: p.socketId,
        nickname: p.nickname,
        balloonSize: p.balloonSize,
        popped: p.popped,
        popTime: p.popTime,
        popOrder: null, // 풍선 터지지 않음
      });
    });
    popped.forEach(p => {
      sortedPlayers.push({
        socketId: p.socketId,
        nickname: p.nickname,
        balloonSize: p.balloonSize,
        popped: p.popped,
        popTime: p.popTime,
        popOrder: popOrderMap[p.userId] || null,
      });
    });
  
    io.to(roomCode).emit('balloon:gameEnded', sortedPlayers);
  }
  

/**
 * 현재 플레이어 목록 브로드캐스트
 */
function broadcastPlayerList(io, roomCode) {
  const room = rooms[roomCode];
  if (!room) return;

  const playerList = Object.values(room.players).map((p) => ({
    socketId: p.socketId,
    nickname: p.nickname,
  }));
  io.to(roomCode).emit('balloon:playerList', playerList);
}

/**
 * 풍선불기 게임 소켓 로직
 */
function handleBalloonGameConnection(socket, io) {
  // 모든 이벤트 수신 시 마지막 활동시각 갱신
  socket.onAny((eventName, ...args) => {
    const userId = socketToUserMap[socket.id];
    if (!userId) return;
    const { roomCode } = socket.data;
    if (roomCode && rooms[roomCode] && rooms[roomCode].players[userId]) {
      rooms[roomCode].players[userId].lastActivityAt = Date.now();
    }
  });

  /**
   * 방 생성
   */
  socket.on('balloon:createRoom', ({ userId, nickname }) => {
    socketToUserMap[socket.id] = userId;

    const roomCode = generateRoomCode();
    // 풍선불기 게임용 방 초기화
    rooms[roomCode] = {
      hostUserId: userId,
      players: {},
      gameInProgress: false,
      timeLeft: 0,
      timerInterval: null,
      balloonThreshold: 0, // 랜덤 설정될 풍선 임계값
    };

    // 플레이어 초기화
    rooms[roomCode].players[userId] = {
      userId,
      socketId: socket.id,
      nickname,
      balloonSize: 0,
      popped: false,
      popTime: null,
      lastActivityAt: Date.now(),
    };

    socket.join(roomCode);
    socket.data.roomCode = roomCode;

    socket.emit('balloon:roomCreated', { roomCode });
    broadcastPlayerList(io, roomCode);
  });

  /**
   * 방 입장
   */
  socket.on('balloon:joinRoom', ({ roomCode, userId, nickname }) => {
    socketToUserMap[socket.id] = userId;

    if (!rooms[roomCode]) {
      socket.emit('joinError', '존재하지 않는 방 코드입니다.');
      return;
    }
    const room = rooms[roomCode];

    if (room.players[userId]) {
      room.players[userId].socketId = socket.id;
      room.players[userId].nickname = nickname;
      room.players[userId].lastActivityAt = Date.now();
    } else {
      if (Object.keys(room.players).length >= MAX_PLAYERS) {
        socket.emit('joinError', '정원 초과입니다. 최대 8명');
        return;
      }
      room.players[userId] = {
        userId,
        socketId: socket.id,
        nickname,
        balloonSize: 0,
        popped: false,
        popTime: null,
        lastActivityAt: Date.now(),
      };
    }

    socket.join(roomCode);
    socket.data.roomCode = roomCode;
    broadcastPlayerList(io, roomCode);
  });

  /**
   * 게임 시작
   */
  socket.on('balloon:startGame', () => {
    const { roomCode } = socket.data;
    if (!roomCode || !rooms[roomCode]) return;

    const room = rooms[roomCode];
    const userId = socketToUserMap[socket.id];
    if (!userId) return;

    if (room.hostUserId !== userId) {
      socket.emit('startGameError', '방장만 게임을 시작할 수 있습니다.');
      return;
    }
    if (room.gameInProgress) {
      socket.emit('startGameError', '이미 게임이 진행 중입니다.');
      return;
    }
    if (Object.keys(room.players).length < MIN_PLAYERS) {
      socket.emit('startGameError', `최소 ${MIN_PLAYERS}명 이상이어야 시작 가능합니다.`);
      return;
    }

    room.gameInProgress = true;
    room.timeLeft = GAME_DURATION;
    room.balloonThreshold = Math.floor(Math.random() * 50) + 50; // 임의의 임계값 설정 (예: 50 ~ 100)
    Object.values(room.players).forEach((player) => {
      player.balloonSize = 0;
      player.popped = false;
      player.popTime = null;
    });

    io.to(roomCode).emit('balloon:gameStarted', { timeLeft: room.timeLeft, threshold: room.balloonThreshold });

    room.timerInterval = setInterval(() => {
      room.timeLeft--;
      io.to(roomCode).emit('balloon:timeUpdate', room.timeLeft);

      if (room.timeLeft <= 0) {
        endGame(io, roomCode);
      }
    }, 1000);
  });

  /**
   * 풍선 불기 액션
   */
  socket.on('balloon:blow', () => {
    const { roomCode } = socket.data;
    if (!roomCode || !rooms[roomCode]) return;
    const room = rooms[roomCode];
    if (!room.gameInProgress) return;

    const userId = socketToUserMap[socket.id];
    if (!userId) return;

    const player = room.players[userId];
    if (!player || player.popped) return;

    // 풍선 부피 증가 (고정 또는 랜덤 값)
    const increment = Math.floor(Math.random() * 5) + 1; // 1~5 증가
    player.balloonSize += increment;

    // 풍선이 터졌는지 확인
    if (player.balloonSize >= room.balloonThreshold) {
      player.popped = true;
      player.popTime = Date.now();
      io.to(roomCode).emit('balloon:popped', { socketId: socket.id, nickname: player.nickname });
    } else {
      io.to(roomCode).emit('balloon:sizeUpdate', { socketId: socket.id, balloonSize: player.balloonSize });
    }
  });

  /**
   * 채팅 메시지
   */
  socket.on('balloon:sendChatMessage', (message) => {
    const { roomCode } = socket.data;
    if (!roomCode || !rooms[roomCode]) return;
    const room = rooms[roomCode];
    const userId = socketToUserMap[socket.id];
    if (!room.players[userId]) return;
    const nickname = room.players[userId].nickname || 'unknown';
    io.to(roomCode).emit('balloon:chatMessage', { nickname, message });
  });

  /**
   * 연결 해제
   */
  socket.on('disconnect', () => {
    const userId = socketToUserMap[socket.id];
    delete socketToUserMap[socket.id];
    Object.keys(rooms).forEach((rc) => {
      const room = rooms[rc];
      if (room.players[userId] && room.players[userId].socketId === socket.id) {
        delete room.players[userId];
        if (room.hostUserId === userId) {
          const remaining = Object.keys(room.players);
          if (remaining.length > 0) {
            room.hostUserId = room.players[remaining[0]].userId;
          }
        }
        if (Object.keys(room.players).length === 0) {
          delete rooms[rc];
        } else {
          broadcastPlayerList(io, rc);
        }
      }
    });
  });
}

module.exports = {
  handleBalloonGameConnection,
  rooms,
  endGame,
};
