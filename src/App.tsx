// client/src/App.tsx
import { useState } from 'react';
import DiceGame from './components/DiceGame'; // (주사위 게임이 있다면)
import MoleGame from './components/MoleGame';
import MoleGameLobby from './components/MoleGameLobby';

type GameMode = 'home' | 'dice' | 'moleLobby' | 'moleGame';

function App() {
  const [gameMode, setGameMode] = useState<GameMode>('home');

  // 두더지 게임 방 정보
  const [roomCode, setRoomCode] = useState('');
  const [isHost, setIsHost] = useState(false);

  // 로비에서 방 생성/입장 완료 시
  const handleJoinedRoom = (code: string, host: boolean) => {
    setRoomCode(code);
    setIsHost(host);
    setGameMode('moleGame');
  };

  return (
    <div style={{ padding: 16 }}>
      {gameMode === 'home' && (
        <div>
          <h1>멀티플레이 미니게임 플랫폼</h1>
          <button onClick={() => setGameMode('dice')}>주사위 게임</button>
          <button onClick={() => setGameMode('moleLobby')}>두더지 잡기</button>
        </div>
      )}

      {gameMode === 'dice' && (
        <DiceGame onGoHome={() => setGameMode('home')} />
      )}

      {gameMode === 'moleLobby' && (
        <MoleGameLobby onJoinedRoom={handleJoinedRoom} />
      )}

      {gameMode === 'moleGame' && (
        <MoleGame
          roomCode={roomCode}
          isHost={isHost}
          onGoHome={() => setGameMode('home')}
        />
      )}
    </div>
  );
}

export default App;
