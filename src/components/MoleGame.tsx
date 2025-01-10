// client/src/components/MoleGame.tsx
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import generateRandomId from '../utils/generateRandomId';

type MoleGameProps = {
  onGoHome: () => void; // App.tsx 등에서 메인으로 돌아가기 위한 함수
};

interface IPlayer {
  socketId: string;
  nickname: string;
  score: number;
}

const BOARD_SIZE = 3; // 3x3
const socket: Socket = io('http://localhost:4000'); // 서버 주소 맞게 조정

function MoleGame({ onGoHome }: MoleGameProps) {
  const [userId, setUserId] = useState('');
  const [nickname, setNickname] = useState('');
  const [isJoined, setIsJoined] = useState(false);

  const [playerList, setPlayerList] = useState<IPlayer[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [moleIndex, setMoleIndex] = useState(-1);
  const [startGameError, setStartGameError] = useState('');
  const [gameResult, setGameResult] = useState<IPlayer[] | null>(null);

  useEffect(() => {
    setUserId(generateRandomId());
  }, []);

  // 소켓 이벤트 등록
  useEffect(() => {
    // ========== mole:playerList ==========
    socket.on('mole:playerList', (players: IPlayer[]) => {
      setPlayerList(players);
    });

    // ========== mole:joinError ==========
    socket.on('joinError', (msg: string) => {
      alert(msg);
    });

    // ========== mole:startGameError ==========
    socket.on('startGameError', (msg: string) => {
      setStartGameError(msg);
      setTimeout(() => setStartGameError(''), 3000);
    });

    // ========== mole:gameStarted ==========
    socket.on('mole:gameStarted', ({ timeLeft }: { timeLeft: number }) => {
      setGameStarted(true);
      setTimeLeft(timeLeft);
      setGameResult(null);
    });

    // ========== mole:timeUpdate ==========
    socket.on('mole:timeUpdate', (t: number) => {
      setTimeLeft(t);
    });

    // ========== mole:showMole ==========
    socket.on('mole:showMole', (index: number) => {
      setMoleIndex(index);
    });

    // ========== mole:scoreUpdate ==========
    socket.on('mole:scoreUpdate', ({ socketId, score }) => {
      setPlayerList((prev) =>
        prev.map((p) => (p.socketId === socketId ? { ...p, score } : p))
      );
    });

    // ========== mole:gameEnded ==========
    socket.on('mole:gameEnded', (sortedPlayers: IPlayer[]) => {
      setGameStarted(false);
      setGameResult(sortedPlayers);
      setMoleIndex(-1);
    });

    return () => {
      socket.off('mole:playerList');
      socket.off('joinError');
      socket.off('startGameError');
      socket.off('mole:gameStarted');
      socket.off('mole:timeUpdate');
      socket.off('mole:showMole');
      socket.off('mole:scoreUpdate');
      socket.off('mole:gameEnded');
    };
  }, []);

  // 접속(게임 참가)
  const handleJoin = () => {
    if (!nickname.trim()) {
      alert('닉네임을 입력하세요.');
      return;
    }
    socket.emit('mole:join', { userId, nickname });
    setIsJoined(true);
  };

  // 게임 시작
  const handleStartGame = () => {
    socket.emit('mole:startGame');
  };

  // 두더지 클릭
  const handleMoleClick = (index: number) => {
    if (index === moleIndex) {
      // 맞춰야 점수 득점
      socket.emit('mole:hitMole', index);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <button onClick={onGoHome}>← 메인으로</button>
      <h2>두더지 잡기 게임</h2>

      {!isJoined ? (
        <div>
          <p>내 랜덤 ID: {userId}</p>
          <input
            type="text"
            placeholder="닉네임"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <button onClick={handleJoin}>게임 참가</button>
        </div>
      ) : (
        <div>
          <h3>안녕하세요, {nickname}님!</h3>
          <p>현재 접속자: {playerList.length}명</p>
          {!gameStarted ? (
            <div>
              <button onClick={handleStartGame}>게임 시작</button>
              {startGameError && <p style={{ color: 'red' }}>{startGameError}</p>}
              <p>(최소 3명 이상 필요)</p>
            </div>
          ) : (
            <div>
              <h4>게임 진행 중! 남은 시간: {timeLeft}s</h4>
              {/* 3x3 보드 */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${BOARD_SIZE}, 80px)`,
                  gap: '10px',
                }}
              >
                {Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map((_, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleMoleClick(idx)}
                    style={{
                      width: '80px',
                      height: '80px',
                      border: '1px solid black',
                      backgroundColor: idx === moleIndex ? 'brown' : 'lightgreen',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {idx === moleIndex ? '두더지!' : ''}
                  </div>
                ))}
              </div>
            </div>
          )}

          <hr />
          <h4>점수판</h4>
          <ul>
            {playerList.map((p) => (
              <li key={p.socketId}>
                {p.nickname} : {p.score}점
              </li>
            ))}
          </ul>
          {gameResult && (
            <div>
              <h3>게임 종료!</h3>
              <ol>
                {gameResult.map((p, i) => (
                  <li key={p.socketId}>
                    {i + 1}등 - {p.nickname} ({p.score}점)
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MoleGame;
