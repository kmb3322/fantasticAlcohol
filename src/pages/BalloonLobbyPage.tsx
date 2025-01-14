// src/pages/BalloonLobbyPage.tsx
import { Flex } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import BalloonGameLobby from '../components/BalloonGameLobby';

function BalloonLobbyPage() {
  const navigate = useNavigate();

  const handleJoinedRoom = (roomCode: string, isHost: boolean) => {
    navigate('/balloon/game', { state: { roomCode, isHost } });
  };

  return (
    <Flex direction="column" align="center" width="100%" bg="#ffffff" minWidth="100vw" minHeight="100vh">
      <BalloonGameLobby onJoinedRoom={handleJoinedRoom} />
    </Flex>
  );
}

export default BalloonLobbyPage;
