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
    Image,
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
  popOrder?: number | null;
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
    <Box p={5} bg="#f5f5f5" minH="100vh">
      <Button 
        onClick={handleGoHome} 
        colorScheme="teal" 
        variant="outline" 
        ml={-10} 
        mb={10}
      >
        ← 메인으로
      </Button>

      <VStack align="center" spacing={3}>

        {/* 게임 시작 전일 때만 방 코드와 접속자 수 표시 */}
        {!gameStarted && (
          <>
          <Image
                  width="211px"
                  height="94px"
                  objectFit="contain"
                  mb="2px"
                  src="/balloon.png"
                  alt="balloon logo"
                />
                <Text fontWeight={700} fontSize="28px" opacity={0.8} mb="-2px">
                  풍선 불기
                </Text>

          <Text fontSize="sm" mt={-2} color="gray.500">
            최소 2명, 최대 8명이 함께 플레이 가능합니다.
          </Text>
          <Text fontSize={16} color="gray.500" mt={5} mb={-5}>
            방 코드
          </Text>
          <Text fontSize="38px" fontWeight={700} color="#14ACA4" mb={-3}>
            {roomCode}
          </Text>
          <Text fontSize={16} color="gray.500" mt={5} mb={-5}>
            접속자
          </Text>
          <Text fontSize="38px" fontWeight={700} color="#14ACA4">
            {playerList.length}명
          </Text>
        </>
        )}
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
            <Text fontSize={30} color="red.600" fontWeight={700} mb={7}>풍선을 불어보세요!</Text>

            <Text fontSize={16} color="gray.500" mt={5} mb={-2}>
            남은 시간
          </Text>
       
          <Text fontSize="38px" fontWeight={700} color="#14ACA4" mb={150}>
            {timeLeft}초
          </Text>
          <VStack spacing={4}>
            
            <AnimatePresence>
              {!balloonPopped && (
                <MotionBox
                  key="balloon"
                  width="150px"
                  height="200px"
                  backgroundImage="url('/balloon.png')"
                  backgroundSize="contain"
                  backgroundRepeat="no-repeat"
                  animate={{
                    scale: balloonScale,
                    rotate: [-1, 1, -1, 1, 0],
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                    rotate: {
                      repeat: Infinity,
                      repeatType: "mirror",
                      duration: 0.5,
                    }
                  }}
                />
              )}
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
            <Button 
              colorScheme="pink" 
              onClick={handleBlow} 
              disabled={balloonPopped}
            >
              바람 불기
            </Button>
          </VStack>
        </Box>
      )}

      <Divider my={4} />

      {gameResult && (
        <Box mt={5}>
          <Heading size="md" mb={2}>
            게임 종료!
          </Heading>
          <OrderedList>
            {gameResult.map((p, i) => (
              <ListItem key={p.socketId}>
                {i + 1}등 - <Box as="span" fontWeight={700}>{p.nickname}</Box> (크기: {p.balloonSize}
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
