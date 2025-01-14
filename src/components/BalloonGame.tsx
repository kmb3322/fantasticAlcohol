// src/components/BalloonGame.tsx
import { useEffect, useState } from 'react';
import { socket } from '../socket';
import BalloonGameWaiting from './BalloonGameWaiting';

// Chakra UI 및 Framer Motion
import {
    Box,
    Button,
    Divider,
    Heading,
    ListItem,
    OrderedList,
    Text,
    VStack,
} from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';

interface IPlayer {
  socketId: string;
  nickname: string;
  balloonSize: number;
  popped?: boolean;
  popTime?: number | null;
}

type BalloonGameProps = {
  roomCode: string;
  isHost: boolean;
  onGoHome: () => void;
};

const MotionBox = motion(Box);

function BalloonGame({ roomCode, isHost, onGoHome }: BalloonGameProps) {
  const [playerList, setPlayerList] = useState<IPlayer[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startGameError, setStartGameError] = useState('');
  const [gameResult, setGameResult] = useState<IPlayer[] | null>(null);
  
  // 풍선 애니메이션 및 상태 관련
  const [balloonScale, setBalloonScale] = useState(1);
  const [balloonPopped, setBalloonPopped] = useState(false);

  useEffect(() => {
    const handlePlayerList = (players: IPlayer[]) => setPlayerList(players);
    socket.on('balloon:playerList', handlePlayerList);

    const handleStartGameError = (msg: string) => {
      setStartGameError(msg);
    };
    socket.on('startGameError', handleStartGameError);

    const handleGameStarted = ({ timeLeft }: { timeLeft: number }) => {
      setGameStarted(true);
      setTimeLeft(timeLeft);
      setGameResult(null);
      setBalloonScale(1);
      setBalloonPopped(false);
    };
    socket.on('balloon:gameStarted', handleGameStarted);

    const handleTimeUpdate = (t: number) => setTimeLeft(t);
    socket.on('balloon:timeUpdate', handleTimeUpdate);

    const handleGameEnded = (sortedPlayers: IPlayer[]) => {
      setGameStarted(false);
      setGameResult(sortedPlayers);
    };
    socket.on('balloon:gameEnded', handleGameEnded);

    const handleBalloonPopped = ({ socketId }: { socketId: string }) => {
      // 자신이 터뜨린 경우에만 처리
      if (socket.id === socketId) {
        setBalloonPopped(true);
      }
    };
    socket.on('balloon:popped', handleBalloonPopped);

    return () => {
      socket.off('balloon:playerList', handlePlayerList);
      socket.off('startGameError', handleStartGameError);
      socket.off('balloon:gameStarted', handleGameStarted);
      socket.off('balloon:timeUpdate', handleTimeUpdate);
      socket.off('balloon:gameEnded', handleGameEnded);
      socket.off('balloon:popped', handleBalloonPopped);
    };
  }, []);

  const handleStartGame = () => {
    socket.emit('balloon:startGame');
  };

  const handleGoHome = () => {
    onGoHome();
  };

  const handleBlow = () => {
    if (balloonPopped) return;
    socket.emit('balloon:blow');
    setBalloonScale(prev => prev + 0.15);
  };

  return (
    <Box p={5} bg="gray.50" minH="100vh">
      <Button onClick={handleGoHome} colorScheme="teal" variant="outline" mb={3}>
        ← 메인으로
      </Button>

      <VStack align="start" spacing={3}>
        <Heading size="md">풍선 불기 (방 코드: {roomCode})</Heading>
        <Text>현재 접속자: {playerList.length}명</Text>
      </VStack>

      <Divider my={4} />

      {!gameStarted ? (
        <BalloonGameWaiting
          isHost={isHost}
          startGameError={startGameError}
          onStartGame={handleStartGame}
        />
      ) : (
        <Box textAlign="center">
          <Heading size="sm" mb={4}>
            게임 진행 중! 남은 시간: {timeLeft}s
          </Heading>
          <VStack spacing={4}>
            <Text fontSize="lg">풍선을 불어보세요!</Text>
            <AnimatePresence>
              {/* 풍선이 터지지 않았을 때의 풍선 표시 */}
              {!balloonPopped && (
                <MotionBox
                  key="balloon"
                  width="150px"
                  height="200px"
                  backgroundImage="url('/balloon.png')"  // 풍선 이미지 경로
                  backgroundSize="contain"
                  backgroundRepeat="no-repeat"
                  animate={{
                    scale: balloonScale,
                    // 물리적 효과: 미세한 흔들림 및 크기 진동
                    rotate: [ -1, 1, -1, 1, 0 ],
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                    // 흔들림 효과 주기 설정
                    rotate: {
                      repeat: Infinity,
                      repeatType: "mirror",
                      duration: 0.5,
                    }
                  }}
                />
              )}
              {/* 풍선 터졌을 때 '탈락' 표시 */}
              {balloonPopped && (
                <MotionBox
                  key="failed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Text fontSize="2xl" fontWeight="bold" color="red.500">
                    탈락
                  </Text>
                </MotionBox>
              )}
            </AnimatePresence>
            <Button colorScheme="pink" onClick={handleBlow} disabled={balloonPopped}>
              바람 불기
            </Button>
          </VStack>
        </Box>
      )}

      <Divider my={4} />

      <Heading size="sm" mb={2}>
        점수판
      </Heading>
      <VStack align="start">
        {playerList.map((p) => (
          <Text key={p.socketId}>
            {p.nickname} : {p.popped ? '터짐' : `크기 ${p.balloonSize}`}
          </Text>
        ))}
      </VStack>

      {gameResult && (
  <Box mt={5}>
    <Heading size="md" mb={2}>
      게임 종료!
    </Heading>
    <OrderedList>
      {gameResult.map((p, i) => (
        <ListItem key={p.socketId}>
          {i + 1}등 - {p.nickname} (크기: {p.balloonSize}
          {p.popped && p.popOrder
            ? `, ${p.popOrder}번째로 터짐`
            : p.popped
            ? ', 터짐'
            : ''}
          )
        </ListItem>
      ))}
    </OrderedList>
  </Box>
)}
    </Box>
  );
}

export default BalloonGame;
