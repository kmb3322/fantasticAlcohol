// src/components/MoleGame.tsx
import { useEffect, useState } from 'react';
import { socket } from '../socket';
import MoleGameWaiting from './MoleGameWaiting';

import {
  Box,
  Button,
  Divider,
  Grid,
  Heading,
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
  useDisclosure,
  useToast,
  VStack
} from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';

const MotionBox = motion(Box);

interface IPlayer {
  socketId: string;
  nickname: string;
  score: number;
}

type MoleGameProps = {
  roomCode: string;
  isHost: boolean;
  onGoHome: () => void;
};

const BOARD_SIZE = 5;

function MoleGame({ roomCode, isHost, onGoHome }: MoleGameProps) {
  const [playerList, setPlayerList] = useState<IPlayer[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [moleIndex, setMoleIndex] = useState(-1);
  const [startGameError, setStartGameError] = useState('');
  const [gameResult, setGameResult] = useState<IPlayer[] | null>(null);
  const [clickedMoleIndex, setClickedMoleIndex] = useState<number | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const toast = useToast();

  useEffect(() => {
    const handlePlayerList = (players: IPlayer[]) => setPlayerList(players);
    socket.on('mole:playerList', handlePlayerList);

    const handleStartGameError = (msg: string) => {
      setStartGameError(msg);
      toast({
        title: '게임 시작 오류',
        description: msg,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    };
    socket.on('startGameError', handleStartGameError);

    const handleGameStarted = ({ timeLeft }: { timeLeft: number }) => {
      setGameStarted(true);
      setTimeLeft(timeLeft);
      setGameResult(null);
      setMoleIndex(-1);
      setClickedMoleIndex(null);
    };
    socket.on('mole:gameStarted', handleGameStarted);

    const handleTimeUpdate = (t: number) => setTimeLeft(t);
    socket.on('mole:timeUpdate', handleTimeUpdate);

    const handleShowMole = (index: number) => {
      setMoleIndex(index);
      setClickedMoleIndex(null);
    };
    socket.on('mole:showMole', handleShowMole);

    const handleScoreUpdate = ({
      socketId,
      score,
    }: {
      socketId: string;
      score: number;
    }) => {
      setPlayerList((prev) =>
        prev.map((p) => (p.socketId === socketId ? { ...p, score } : p))
      );
    };
    socket.on('mole:scoreUpdate', handleScoreUpdate);

    const handleGameEnded = (sortedPlayers: IPlayer[]) => {
      setGameStarted(false);
      setGameResult(sortedPlayers);
      setMoleIndex(-1);
      setClickedMoleIndex(null);
    };
    socket.on('mole:gameEnded', handleGameEnded);

    const handleHideMole = () => {
      setMoleIndex(-1);
      setClickedMoleIndex(null);
    };
    socket.on('mole:hideMole', handleHideMole);

    return () => {
      socket.off('mole:playerList', handlePlayerList);
      socket.off('startGameError', handleStartGameError);
      socket.off('mole:gameStarted', handleGameStarted);
      socket.off('mole:timeUpdate', handleTimeUpdate);
      socket.off('mole:showMole', handleShowMole);
      socket.off('mole:scoreUpdate', handleScoreUpdate);
      socket.off('mole:gameEnded', handleGameEnded);
      socket.off('mole:hideMole', handleHideMole);
    };
  }, [toast]);

  useEffect(() => {
    if (gameResult) {
      onOpen();
    }
  }, [gameResult, onOpen]);

  const handleStartGame = () => {
    socket.emit('mole:startGame');
  };

  const handleMoleClick = (index: number) => {
    setClickedMoleIndex(index);
    socket.emit('mole:hitMole', index);
  };

  return (
    <Box p={5} bg="#f5f5f5" minH="100vh">
      {/* 게임이 시작되지 않았을 때만 메인으로 버튼 표시 */}
      {!gameStarted && (
        <Button 
          onClick={onGoHome} 
          colorScheme="teal" 
          variant="outline" 
          ml={-4} 
        >
          ← 메인으로
        </Button>
      )}

      <VStack align="center" spacing={3}>
        <Image
          mt={10}
          width="211px"
          height="94px"
          objectFit="contain"
          mb="2px"
          src="/cat.png"
          alt="cat logo"
        />
        <Text fontWeight={700} fontSize="28px" opacity={0.8} mb="-2px">
          고양이 잡기
        </Text>

        {gameStarted && (
          <>
            <Text fontSize="20px" fontWeight={700} mt={5} mb={1}>
              잡은 고양이 수
            </Text>
            <VStack align="center" spacing={1}>
              {playerList.map((p) => (
                <Text as="span" key={p.socketId}>
                  <Box as="span" fontWeight={700}>{p.nickname}</Box> : {p.score}마리
                </Text>
              ))}
            </VStack>
          </>
        )}

        {!gameStarted && (
          <>
            <Text fontSize="14px" mt={-3} color="gray.500">
              30초 동안 튀어나오는 고양이를 가장 많이 잡으면 우승!
            </Text>
            <Text fontSize={16} color="gray.500" mt={2} mb={-5}>
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
            <Text fontSize="sm" mt={-4} color="gray.500">
              최소 2명, 최대 8명이 함께 플레이 가능합니다.
            </Text>
          </>
        )}
      </VStack>

      <Divider my={4} />

      {!gameStarted ? (
        <MoleGameWaiting
          isHost={isHost}
          startGameError={startGameError}
          onStartGame={handleStartGame}
        />
      ) : (
        <Box>
          <Heading size="sm" mb={4}>
            게임 진행 중! 남은 시간: {timeLeft}s
          </Heading>
          <Grid
            templateColumns={`repeat(${BOARD_SIZE}, 50px)`}
            gap={6}
            justifyContent="start"
          >
            {Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map((_, idx) => (
              <Box
                key={idx}
                position="relative"
                w="50px"
                h="50px"
                bg="green.400"
                borderRadius="full"
                boxShadow="inset 0 0 15px rgba(0, 0, 0, 0.5)"
                overflow="hidden"
              >
                <AnimatePresence mode="sync">
                  {moleIndex === idx && (
                    <MotionBox
                      key={`mole-${idx}`}
                      position="absolute"
                      bottom="0"
                      left="0%"
                      transform="translateX(-50%)"
                      initial={{ y: 50, scale: 0, opacity: 0 }}
                      animate={{
                        y: 0,
                        scale: 1,
                        opacity: 1,
                        transition: {
                          duration: 0.4,
                          type: 'spring',
                          bounce: 0.4,
                        },
                      }}
                      exit={
                        clickedMoleIndex === idx
                          ? {
                              y: -80,
                              scale: 2,
                              opacity: 0,
                              transition: { duration: 0.4, ease: 'easeIn' },
                            }
                          : {
                              y: 80,
                              scale: 0.5,
                              opacity: 0,
                              transition: { duration: 0.4, ease: 'easeIn' },
                            }
                      }
                      onClick={() => handleMoleClick(idx)}
                      onAnimationComplete={() => {
                        if (moleIndex !== idx) {
                          setClickedMoleIndex(null);
                        }
                      }}
                    >
                      <Image
                        src="/kitty.png"
                        alt="mole"
                        w="50px"
                        h="50px"
                        objectFit="contain"
                        cursor="pointer"
                      />
                    </MotionBox>
                  )}
                </AnimatePresence>
              </Box>
            ))}
          </Grid>
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
                {/* 축하 애니메이션 효과 예시 (고양이 이미지와 함께) */}
                <MotionBox
                  key="celebrate"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.5, 1] }}
                  transition={{ duration: 1 }}
                >
                  <Image src="/cat.png" alt="celebrate"
                  width="131px"
                  height="94px"
                />
                </MotionBox>
              </AnimatePresence>
              <OrderedList>
                {gameResult?.map((p, i) => (
                  <ListItem key={p.socketId}>
                    {i + 1}등 - <Box as="span" fontWeight={700}>{p.nickname}</Box> ({p.score}점)
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

export default MoleGame;
