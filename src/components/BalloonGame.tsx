// src/components/BalloonGame.tsx
import { useEffect, useState } from 'react';
import { socket } from '../socket';
import BalloonGameWaiting from './BalloonGameWaiting';

import {
  Box,
  Button,
  Divider,
  Image,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  OrderedList,
  Text,
  VStack,
  useDisclosure
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

const popSound = new Audio('/pop.mp3');

function BalloonGame({ roomCode, isHost, onGoHome }: BalloonGameProps) {
  const [playerList, setPlayerList] = useState<IPlayer[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startGameError, setStartGameError] = useState('');
  const [gameResult, setGameResult] = useState<IPlayer[] | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  
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
      if (socket.id === socketId) {
        setBalloonPopped(true);
        popSound.play();
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

  // 게임 결과가 업데이트되면 모달 열기
  useEffect(() => {
    if (gameResult) {
      onOpen();
    }
  }, [gameResult, onOpen]);

  const handleStartGame = () => {
    socket.emit('balloon:startGame');
  };

  const handleGoHome = () => {
    onGoHome();
  };

  const handleBlow = () => {
    if (balloonPopped) return;

    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    socket.emit('balloon:blow');
    setBalloonScale(prev => prev + 0.15);
  };

  return (
    <Box p={5} bg="#f5f5f5" minH="100vh">
      {/* 게임이 시작되지 않았을 때만 메인으로 버튼 표시 */}
      {!gameStarted && (
        <Button 
          onClick={handleGoHome} 
          colorScheme="teal" 
          variant="outline" 
          ml={-4} 

        >
          ← 메인으로
        </Button>
      )}

      <VStack align="center" spacing={3}>
        {!gameStarted && (
          <>
            <Image
              mt={10}
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
              풍선 불기 버튼으로, 20초 내에 가장 큰 풍선을 불어주세요!
            </Text>
            <Text fontSize="sm" mt={-2} color="gray.500">
              너무 크게 불면 터져 버릴 수도 있어요.
            </Text>
            <Text fontSize={16} color="gray.500" mt={2} mb={-5}>
              방 코드
            </Text>
            <Text fontSize={38} fontWeight={700} color="#14ACA4" mb={-3}>
              {roomCode}
            </Text>
            <Text fontSize={16} color="gray.500" mt={5} mb={-5}>
              접속자
            </Text>
            <Text fontSize={38} fontWeight={700} color="#14ACA4">
              {playerList.length}명
            </Text>
            <Text fontSize="sm" mt={-4} color="gray.500">
              최소 2명, 최대 8명이 함께 플레이 가능합니다.
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
          <Text fontSize={30} color="red.600" fontWeight={700} mb={7}>
            풍선을 불어보세요!
          </Text>

          <Text fontSize={16} color="gray.500" mt={5} mb={-2}>
            남은 시간
          </Text>

          <Text fontSize={38} fontWeight={700} color="#14ACA4" mb={150}>
            {timeLeft}초
          </Text>
          <VStack spacing={4}>
            <AnimatePresence>
              {!balloonPopped ? (
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
              ) : (
                <MotionBox
                  key="pop"
                  width="150px"
                  height="200px"
                  backgroundImage="url('/balloon.png')"
                  backgroundSize="contain"
                  backgroundRepeat="no-repeat"
                  initial={{ scale: balloonScale, opacity: 1 }}
                  animate={{ scale: balloonScale * 2, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                />
              )}
            </AnimatePresence>
            {balloonPopped && (
            <Text color="red.500" mt={-200} mb={200} fontSize={40} fontWeight={700}>
              탈락
            </Text>
          )}
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

      {/* 모달: 게임 결과 표시 */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign="center">게임 종료!</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={3}>
              <AnimatePresence>
                {/* 축하 애니메이션 효과 예시 (풍선 이미지와 함께) */}
                <MotionBox
                  key="celebrate"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.5, 1] }}
                  transition={{ duration: 1 }}
                >
                  <Image src="/balloon.png" alt="celebrate" boxSize="100px" />
                </MotionBox>
              </AnimatePresence>
              <OrderedList>
                {gameResult?.map((p, i) => (
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
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={onClose}>
              확인
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default BalloonGame;
