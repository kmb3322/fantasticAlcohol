// client/src/App.tsx
import { useState } from 'react';
import DiceGame from './components/DiceGame';
import MoleGame from './components/MoleGame';

type GameMode = 'home' | 'dice' | 'mole';

function App() {
  const [gameMode, setGameMode] = useState<GameMode>('home');

  return (
    <div style={{ padding: 16 }}>
      {gameMode === 'home' && (
        <div>
          <h1>멀티플레이 미니게임 플랫폼</h1>
          <button onClick={() => setGameMode('dice')}>주사위 게임</button>
          <button onClick={() => setGameMode('mole')}>두더지 잡기</button>
        </div>
      )}

      {gameMode === 'dice' && <DiceGame onGoHome={() => setGameMode('home')} />}
      {gameMode === 'mole' && <MoleGame onGoHome={() => setGameMode('home')} />}
    </div>
  );
}

export default App;
