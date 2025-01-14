const MAX_PLAYERS = 8;
const MIN_PLAYERS = 2;
const GAME_DURATION = 30; // 초
const BOARD_SIZE = 5;     // 5x5

// 방 목록 (roomCode -> 방 상태)
// 각 방은 다음 구조를 가집니다:
// rooms[roomCode] = {
//   hostUserId: 'xxx',
//   players: {
//     [userId]: {
//       userId: string,
//       socketId: string,
//       nickname: string,
//       score: number,
//       lastActivityAt: number
//     }
//   },
//   ...
// }
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
  room.currentMoleIndex = -1;

  // ----- 추가된 부분: 두더지를 사라지게 만드는 이벤트
  io.to(roomCode).emit('mole:hideMole');

  // 점수 정렬
  const sortedPlayers = Object.values(room.players)
    .map((p) => ({
      socketId: p.socketId,
      nickname: p.nickname,
      score: p.score,
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

  const playerList = Object.values(room.players).map((p) => ({
    socketId: p.socketId,
    nickname: p.nickname,
    score: p.score,
  }));
  io.to(roomCode).emit('mole:playerList', playerList);
}

/**
 * 두더지 게임 소켓 로직
 */
function handleMoleGameConnection(socket, io) {
  // 어떤 이벤트든 수신하면 마지막 활동시각 갱신
  socket.onAny((eventName, ...args) => {
    const userId = socketToUserMap[socket.id];
    if (!userId) return;

    // roomCode를 찾기 위해 rooms 전체를 뒤지거나,
    // socket.data.roomCode를 사용할 수도 있습니다.
    // 여기서는 socket.data.roomCode 쓰는 기존 로직을 활용.
    const { roomCode } = socket.data;
    if (roomCode && rooms[roomCode] && rooms[roomCode].players[userId]) {
      rooms[roomCode].players[userId].lastActivityAt = Date.now();
    }
  });

  /**
   * 방 생성
   */
  socket.on('mole:createRoom', ({ userId, nickname }) => {
    // userId -> socketId 매핑
    socketToUserMap[socket.id] = userId;

    // 1) 방 코드 생성
    const roomCode = generateRoomCode();

    // 2) rooms에 등록
    rooms[roomCode] = {
      hostUserId: userId, // 방장은 userId로 설정
      players: {},
      gameInProgress: false,
      timeLeft: 0,
      timerInterval: null,
      currentMoleIndex: -1,
    };

    // 3) 방장(현재 소켓/유저)도 players에 추가
    rooms[roomCode].players[userId] = {
      userId,
      socketId: socket.id,
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
    // userId -> socketId 매핑
    socketToUserMap[socket.id] = userId;

    if (!rooms[roomCode]) {
      socket.emit('joinError', '존재하지 않는 방 코드입니다.');
      return;
    }
    const room = rooms[roomCode];

    // 만약 이미 방에 이 userId가 있으면 socketId만 업데이트
    if (room.players[userId]) {
      // 그냥 socketId 갱신
      room.players[userId].socketId = socket.id;
      room.players[userId].nickname = nickname; // 닉네임 수정될 수도 있음
      room.players[userId].lastActivityAt = Date.now();
    } else {
      // 새 유저로 추가
      if (Object.keys(room.players).length >= MAX_PLAYERS) {
        socket.emit('joinError', '정원 초과입니다. 최대 8명');
        return;
      }
      room.players[userId] = {
        userId,
        socketId: socket.id,
        nickname,
        score: 0,
        lastActivityAt: Date.now(),
      };
    }

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
    const userId = socketToUserMap[socket.id];
    if (!userId) return;

    // 방장만 가능 (hostUserId가 같아야 함)
    if (room.hostUserId !== userId) {
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
      socket.emit(
        'startGameError',
        `최소 ${MIN_PLAYERS}명 이상이어야 시작 가능합니다.`
      );
      return;
    }

    // 게임 시작
    room.gameInProgress = true;
    room.timeLeft = GAME_DURATION;
    Object.values(room.players).forEach((player) => {
      player.score = 0;
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

    const userId = socketToUserMap[socket.id];
    if (!userId) return;

    if (moleIndex === room.currentMoleIndex) {
      room.players[userId].score += 1;
      // 이번 두더지 잡힘
      room.currentMoleIndex = -1;
      io.to(roomCode).emit('mole:scoreUpdate', {
        socketId: socket.id, // or userId
        score: room.players[userId].score,
      });
    }
  });

  /**
   * 채팅 메시지
   */
  socket.on('mole:sendChatMessage', (message) => {
    const { roomCode } = socket.data;
    if (!roomCode || !rooms[roomCode]) return;

    const room = rooms[roomCode];
    const userId = socketToUserMap[socket.id];
    if (!room.players[userId]) return;

    const nickname = room.players[userId].nickname || 'unknown';

    io.to(roomCode).emit('mole:chatMessage', {
      nickname,
      message,
    });
  });

  /**
   * 연결 해제
   */
  socket.on('disconnect', () => {
    const userId = socketToUserMap[socket.id];
    delete socketToUserMap[socket.id];

    // socket.data.roomCode로 방을 알아낼 수도 있지만
    // 여러 방에 들어갔을 수도 있으니 전체 rooms 순회
    // (여기서는 간단히 전체 rooms 뒤지는 방식)
    Object.keys(rooms).forEach((rc) => {
      const room = rooms[rc];
      if (room.players[userId] && room.players[userId].socketId === socket.id) {
        // 동일 userId가 다른 탭에서 접속 중이 아닐 경우에만 제거
        // (만약 한 유저가 여러 탭 열었다면, userId는 같아도 소켓은 다름)
        // 여기서는 단일 소켓만 쓴다고 가정하고 그냥 제거
        delete room.players[userId];

        // 만약 방장이 나간다면, 남은 인원 중 첫 번째를 방장으로
        if (room.hostUserId === userId) {
          const remaining = Object.keys(room.players);
          if (remaining.length > 0) {
            room.hostUserId = room.players[remaining[0]].userId;
          }
        }

        // 인원 0이면 방 제거
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
  handleMoleGameConnection,
  rooms,
  endGame,
  // socketToUserMap 등을 필요하다면 export
};
