// client/src/components/DiceGame.tsx
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import generateRandomId from '../utils/generateRandomId';

interface IUser {
  userId: string;
  nickname: string;
  hasRolled: boolean;
  diceValue: number;
}

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
const socket: Socket = io(backendUrl);

type DiceGameProps = {
  onGoHome: () => void;
};

function DiceGame({ onGoHome }: DiceGameProps) {
  const [userId, setUserId] = useState('');
  const [nickname, setNickname] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [userList, setUserList] = useState<IUser[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [rollError, setRollError] = useState('');
  const [gameError, setGameError] = useState('');
  const [gameResult, setGameResult] = useState<{
    winnerNicknames: string[];
    diceValue: number;
  } | null>(null);

  // 1) 유저 ID 생성
  useEffect(() => {
    setUserId(generateRandomId());
  }, []);

  // 2) 소켓 이벤트 등록
  useEffect(() => {
    socket.on('userList', (users: IUser[]) => setUserList(users));

    socket.on('gameStarted', () => {
      setGameStarted(true);
      setGameResult(null);
      setGameError('');
    });

    socket.on('rollError', (msg: string) => {
      setRollError(msg);
      setTimeout(() => setRollError(''), 2000);
    });

    socket.on('gameStartError', (msg: string) => {
      setGameError(msg);
      setTimeout(() => setGameError(''), 3000);
    });

    socket.on('gameResult', (result) => {
      setGameResult(result);
      setGameStarted(false);
    });

    return () => {
      socket.off('userList');
      socket.off('gameStarted');
      socket.off('rollError');
      socket.off('gameStartError');
      socket.off('gameResult');
    };
  }, []);

  // 3) 게임 참가
  const handleJoin = () => {
    if (!nickname.trim()) {
      alert('닉네임을 입력하세요.');
      return;
    }
    socket.emit('join', { userId, nickname });
    setIsJoined(true);
  };

  // 4) 게임 시작
  const handleStartGame = () => {
    socket.emit('startGame');
  };

  // 5) 주사위 굴리기
  const handleRollDice = () => {
    socket.emit('rollDice');
  };

  return (
    <div>
      <button onClick={onGoHome}>← 메인으로</button>
      <h2>주사위 게임</h2>

      {!isJoined ? (
        <div>
          <p>랜덤 ID: {userId}</p>
          <input
            type="text"
            placeholder="닉네임"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <button onClick={handleJoin}>접속하기</button>
        </div>
      ) : (
        <div>
          <h3>안녕하세요, {nickname}님!</h3>
          <p>당신의 ID: {userId}</p>
          {gameError && <p style={{ color: 'red' }}>{gameError}</p>}
          <hr />
          <h4>현재 접속자 목록</h4>
          <ul>
            {userList.map((user) => (
              <li key={user.userId}>
                {user.nickname} / 주사위: {user.diceValue || '-'}{' '}
                {user.hasRolled && '(굴림완료)'}
              </li>
            ))}
          </ul>
          <hr />
          {!gameStarted ? (
            <>
              <button onClick={handleStartGame}>게임 시작하기</button>
              <p style={{ color: 'gray' }}>3명 이상 모여야 시작됩니다</p>
            </>
          ) : (
            <>
              <h4>게임 진행 중!</h4>
              <button onClick={handleRollDice}>주사위 굴리기</button>
              {rollError && <p style={{ color: 'red' }}>{rollError}</p>}
            </>
          )}
          {gameResult && (
            <>
              <h4>결과 발표!</h4>
              <p>
                {gameResult.winnerNicknames.join(', ')} 님이 (
                {gameResult.diceValue} 주사위) 으로 승리!
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default DiceGame;
