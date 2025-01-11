// client/src/components/MoleGame.tsx
import { useEffect, useState } from 'react';
import { socket } from '../socket';
import MoleGameWaiting from './\bMoleGameWaiting';

interface IPlayer {
  socketId: string;
  nickname: string;
  score: number;
}

type MoleGameProps = {
  roomCode: string;
  isHost: boolean;
  onGoHome: () => void;
};

const BOARD_SIZE = 3;

function MoleGame({ roomCode, isHost, onGoHome }: MoleGameProps) {
  const [playerList, setPlayerList] = useState<IPlayer[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [moleIndex, setMoleIndex] = useState(-1);
  const [startGameError, setStartGameError] = useState('');
  const [gameResult, setGameResult] = useState<IPlayer[] | null>(null);

  useEffect(() => {
    // 플레이어 목록
    const handlePlayerList = (players: IPlayer[]) => {
      setPlayerList(players);
    };
    socket.on('mole:playerList', handlePlayerList);

    // startGameError
    const handleStartGameError = (msg: string) => {
      setStartGameError(msg);
      setTimeout(() => setStartGameError(''), 3000);
    };
    socket.on('startGameError', handleStartGameError);

    // gameStarted
    const handleGameStarted = ({ timeLeft }: { timeLeft: number }) => {
      setGameStarted(true);
      setTimeLeft(timeLeft);
      setGameResult(null);
    };
    socket.on('mole:gameStarted', handleGameStarted);

    // timeUpdate
    const handleTimeUpdate = (t: number) => {
      setTimeLeft(t);
    };
    socket.on('mole:timeUpdate', handleTimeUpdate);

    // showMole
    const handleShowMole = (index: number) => {
      setMoleIndex(index);
    };
    socket.on('mole:showMole', handleShowMole);

    // scoreUpdate
    const handleScoreUpdate = ({
      socketId,
      score,
    }: {
      socketId: string;
      score: number;
    }) => {
      setPlayerList((prev) =>
        prev.map((p) => (p.socketId === socketId ? { ...p, score } : p))
      );
    };
    socket.on('mole:scoreUpdate', handleScoreUpdate);

    // gameEnded
    const handleGameEnded = (sortedPlayers: IPlayer[]) => {
      setGameStarted(false);
      setGameResult(sortedPlayers);
      setMoleIndex(-1);
    };
    socket.on('mole:gameEnded', handleGameEnded);

    // 언마운트 시
    return () => {
      socket.off('mole:playerList', handlePlayerList);
      socket.off('startGameError', handleStartGameError);
      socket.off('mole:gameStarted', handleGameStarted);
      socket.off('mole:timeUpdate', handleTimeUpdate);
      socket.off('mole:showMole', handleShowMole);
      socket.off('mole:scoreUpdate', handleScoreUpdate);
      socket.off('mole:gameEnded', handleGameEnded);
    };
  }, []);

  // 방장만 게임 시작 가능
  const handleStartGame = () => {
    socket.emit('mole:startGame');
  };

  // 두더지 클릭
  const handleMoleClick = (index: number) => {
    socket.emit('mole:hitMole', index);
  };

  return (
    <div style={{ padding: 20 }}>
      <button onClick={onGoHome}>← 메인으로</button>
      <h2>두더지 잡기 (방 코드: {roomCode})</h2>
      <p>현재 접속자: {playerList.length}명</p>

      {/** 
       * 여기서 "방장이 게임을 시작하기 전 상태"를
       * 새로운 컴포넌트(MoleGameWaiting)로 분리 
       */}
      {!gameStarted ? (
        <MoleGameWaiting
          isHost={isHost}
          startGameError={startGameError}
          onStartGame={handleStartGame}
        />
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
                  border: '1px solid #333',
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
  );
}

export default MoleGame;
