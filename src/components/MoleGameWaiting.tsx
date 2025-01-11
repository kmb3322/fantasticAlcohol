// src/components/MoleGameWaiting.tsx
interface MoleGameWaitingProps {
    isHost: boolean;
    startGameError: string;
    onStartGame: () => void;
  }
  
  /**
   * 방장이 게임을 시작하기 전, 사람들을 기다리는 상태를 보여주는 컴포넌트
   */
  function MoleGameWaiting({ isHost, startGameError, onStartGame }: MoleGameWaitingProps) {
    return (
      <div>
        {isHost ? (
          <button onClick={onStartGame}>게임 시작</button>
        ) : (
          <p>방장이 시작하기를 기다리는 중...</p>
        )}
        {startGameError && <p style={{ color: 'red' }}>{startGameError}</p>}
        <p>(최소 3명 이상 필요)</p>
      </div>
    );
  }
  
  export default MoleGameWaiting;
  