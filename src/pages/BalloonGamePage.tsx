// src/pages/BalloonGamePage.tsx
import { Flex } from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import BalloonGame from '../components/BalloonGame';

function BalloonGamePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { roomCode: string; isHost: boolean } | null;

  const roomCode = state?.roomCode || '';
  const isHost = state?.isHost || false;

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <Flex direction="column" align="center" width="100%" height="100%" bg="#f5f5f5" minWidth="100vw" minHeight="100vh">
      <BalloonGame roomCode={roomCode} isHost={isHost} onGoHome={handleGoHome} />
    </Flex>
  );
}

export default BalloonGamePage;
