import { Flex, Text, VStack } from '@chakra-ui/react';
import { useState } from 'react';
import MoleGame from './components/MoleGame';
import MoleGameLobby from './components/MoleGameLobby';
import SvgButton from './components/SvgButton';

type GameMode = 'home' | 'moleLobby' | 'moleGame';

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
    

    
    <Flex direction="column" align="center" width="100%" pt="102px" bg="#ffffff" minWidth="100vw" minHeight="100vh">
      <Text fontSize="34px" textAlign="center" fontWeight={700} fontFamily={'Noto Sans KR'}>
            죽음의 술게임 ❤️
          </Text>


      {gameMode === 'home' && (
        <VStack>
          <VStack align="flex-start" width="full">
            <Text fontSize="20px" mt="30px" textAlign="left" fontWeight={700} fontFamily={'Noto Sans KR'}>하나의 폰으로 다함께!</Text>
                <Text fontSize="12px" fontWeight={250} mt={-3}>
                  한 대의 폰으로 재밌는 게임을 시작할 수 있어요
                </Text>

            <Flex direction="row" gap="23px" mt="100px">
              <SvgButton onClick={() => setGameMode('moleLobby')} />
              <SvgButton onClick={() => setGameMode('moleLobby')} />
            </Flex>



              <Text fontSize="20px" mt="100px" textAlign="left" fontWeight={700} fontFamily={'Noto Sans KR'}>각자 폰으로 다함께!</Text>
                <Text fontSize="12px" fontWeight={250} mt={-3}>
                  최대 8대까지 동시에 접속할 수 있어요
                </Text>
                <Flex direction="row" gap="23px" mt="100px">
              <SvgButton onClick={() => setGameMode('moleLobby')}   overlayImage="/cat.png"
              overlayText="고양이 잡기"
              overlaySubtext="장난꾸러기 고양이를 혼쭐내주세요!"  />
              <SvgButton onClick={() => setGameMode('moleLobby')} />
            </Flex>
          </VStack>
        </VStack>
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
    </Flex>
  );
}

export default App;
