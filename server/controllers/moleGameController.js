// server/controllers/moleGameController.js

// 두더지 게임 상태
const MAX_PLAYERS = 8;
const MIN_PLAYERS = 3;
const GAME_DURATION = 20; // 초
const BOARD_SIZE = 3;     // 3x3

let players = {};         // { socketId: { nickname, score } }
let gameInProgress = false;
let timeLeft = 0;
let timerInterval = null;
let currentMoleIndex = -1;

// 소켓 연결 시 호출되는 함수
function handleMoleGameConnection(socket, io) {
  // 유저가 방에 "join"할 때
  socket.on('mole:join', ({ userId, nickname }) => {
    if (Object.keys(players).length >= MAX_PLAYERS) {
      socket.emit('joinError', '정원 초과입니다. 최대 8명');
      return;
    }

    players[socket.id] = {
      nickname,
      score: 0,
    };
    broadcastPlayerList(io);
  });

  // 게임 시작
  socket.on('mole:startGame', () => {
    if (gameInProgress) {
      socket.emit('startGameError', '이미 게임이 진행 중입니다.');
      return;
    }

    if (Object.keys(players).length < MIN_PLAYERS) {
      socket.emit('startGameError', `최소 ${MIN_PLAYERS}명 이상이어야 시작 가능합니다.`);
      return;
    }

    // 게임 시작
    gameInProgress = true;
    timeLeft = GAME_DURATION;

    // 모든 플레이어 점수 초기화
    Object.values(players).forEach((p) => (p.score = 0));

    io.emit('mole:gameStarted', { timeLeft });

    // 타이머 시작
    timerInterval = setInterval(() => {
      timeLeft--;
      io.emit('mole:timeUpdate', timeLeft);

      // 1초마다 두더지 위치 갱신
      currentMoleIndex = Math.floor(Math.random() * (BOARD_SIZE * BOARD_SIZE));
      io.emit('mole:showMole', currentMoleIndex);

      if (timeLeft <= 0) {
        endGame(io);
      }
    }, 1000);
  });

  // 두더지 클릭
  socket.on('mole:hitMole', (moleIndex) => {
    if (!gameInProgress) return;
    if (moleIndex === currentMoleIndex) {
      players[socket.id].score += 1;
      // 이번 두더지는 잡힘
      currentMoleIndex = -1;
      io.emit('mole:scoreUpdate', {
        socketId: socket.id,
        score: players[socket.id].score,
      });
    }
  });

  // 연결 해제
  socket.on('disconnect', () => {
    delete players[socket.id];
    broadcastPlayerList(io);

    // 인원 수 체크(선택적): 인원이 2명 미만이 되었으면 게임을 강제종료할 수도 있음
  });
}

// 게임 종료
function endGame(io) {
  clearInterval(timerInterval);
  gameInProgress = false;
  currentMoleIndex = -1;

  const sortedPlayers = Object.entries(players)
    .map(([sid, info]) => ({ socketId: sid, nickname: info.nickname, score: info.score }))
    .sort((a, b) => b.score - a.score);

  io.emit('mole:gameEnded', sortedPlayers);
}

// 현재 플레이어 목록 브로드캐스트
function broadcastPlayerList(io) {
  const playerList = Object.entries(players).map(([sid, info]) => ({
    socketId: sid,
    nickname: info.nickname,
    score: info.score,
  }));
  io.emit('mole:playerList', playerList);
}

// 외부에서 이 컨트롤러를 사용할 수 있도록 export
module.exports = {
  handleMoleGameConnection,
};
