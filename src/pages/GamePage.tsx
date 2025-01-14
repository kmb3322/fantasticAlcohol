// src/pages/GamePage.tsx
import { Flex } from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import MoleGame from '../components/MoleGame';

function GamePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { roomCode: string; isHost: boolean } | null;

  // 라우트 상태가 없으면 기본값 설정 또는 홈으로 리다이렉트
  const roomCode = state?.roomCode || '';
  const isHost = state?.isHost || false;

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <Flex direction="column" align="center" width="100%" height="100%" bg="#f5f5f5" minWidth="100vw" minHeight="100vh">
      <MoleGame roomCode={roomCode} isHost={isHost} onGoHome={handleGoHome} />
    </Flex>
  );
}

export default GamePage;
