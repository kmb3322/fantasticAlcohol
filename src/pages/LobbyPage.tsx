// src/pages/LobbyPage.tsx
import { Flex } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import MoleGameLobby from '../components/MoleGameLobby';

function LobbyPage() {
  const navigate = useNavigate();

  const handleJoinedRoom = (roomCode: string, isHost: boolean) => {
    // 방 참여 후 게임 페이지로 이동
    // URL에 방 코드나 호스트 여부를 전달하고 싶다면 쿼리 파라미터나 상태를 활용할 수도 있습니다.
    navigate('/game', { state: { roomCode, isHost } });
  };

  return (
    <Flex direction="column" align="center" width="100%" bg="#ffffff" minWidth="100vw" minHeight="100vh">
      <MoleGameLobby onJoinedRoom={handleJoinedRoom} />
    </Flex>
  );
}

export default LobbyPage;
