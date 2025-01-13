import { useEffect, useState } from 'react';
import { socket } from '../socket';
import MoleGameWaiting from './MoleGameWaiting';

// Chakra UI
import {
  Box,
  Button,
  Divider,
  Grid,
  Heading,
  Image,
  ListItem,
  OrderedList,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react';

// Framer Motion
import { AnimatePresence, motion } from 'framer-motion';

// Chakra + Framer Motion 결합용 컴포넌트
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

  // "내가 직접 클릭한 두더지" 인덱스 (애니메이션 구분용)
  const [clickedMoleIndex, setClickedMoleIndex] = useState<number | null>(null);

  const toast = useToast();

  useEffect(() => {
    // --- Socket 이벤트 설정 ---
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
      setClickedMoleIndex(null); // 새 두더지 등장시, 클릭 기록 초기화
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

    // 누군가가 클릭해서 두더지가 사라져야 할 때(내가 클릭하지 않았어도)
    const handleHideMole = () => {
      setMoleIndex(-1);
      // clickedMoleIndex는 그대로 두거나, null로 초기화해도 되지만
      // 어차피 새 두더지 등장시 초기화할 거므로 여기서도 null 처리
      setClickedMoleIndex(null);
    };
    socket.on('mole:hideMole', handleHideMole);

    // --- Cleanup ---
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

  // 방장만 게임 시작 가능
  const handleStartGame = () => {
    socket.emit('mole:startGame');
  };

  // 두더지 클릭
  const handleMoleClick = (index: number) => {
    // 내가 클릭한 moleIndex 기록
    setClickedMoleIndex(index);
    // 서버에 알림
    socket.emit('mole:hitMole', index);
  };

  return (
    <Box p={5} bg="gray.50" minH="100vh">
      <Button onClick={onGoHome} colorScheme="teal" variant="outline" mb={3}>
        ← 메인으로
      </Button>

      <VStack align="start" spacing={3}>
        <Heading size="md">고양이 잡기 (방 코드: {roomCode})</Heading>
        <Text>현재 접속자: {playerList.length}명</Text>
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
          {/* 3x3 보드 */}
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
                {/* AnimatePresence: moleIndex가 idx일 때만 두더지 */}
                <AnimatePresence mode="sync">
                  {moleIndex === idx && (
                    <MotionBox
                      key={`mole-${idx}`}
                      position="absolute"
                      bottom="0"    // 구멍 하단에 두더지 위치
                      left="0%"
                      transform="translateX(-50%)" // 수평 중앙 정렬
                      // 초기 (두더지가 땅속에서 작게 등장)
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
                      // exit 애니메이션 분기:
                      // - 클릭한 두더지이면: 위로 "뽑히듯" 사라짐
                      // - 아니면: 아래로 or 작게 사라짐
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
                      // exit 완료 후 clickedMoleIndex 초기화
                      onAnimationComplete={(definition) => {
                        // definition === "exit" 라는 표시도 가능하지만
                        // 간단히 clickedMoleIndex를 풀어주는 방식
                        if (moleIndex !== idx) {
                          // 현재 구멍의 mole가 더 이상 아니면 사라진 것이므로 초기화
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

      <Heading size="sm" mb={2}>
        점수판
      </Heading>
      <VStack align="start">
        {playerList.map((p) => (
          <Text key={p.socketId}>
            {p.nickname} : {p.score}점
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
                {i + 1}등 - {p.nickname} ({p.score}점)
              </ListItem>
            ))}
          </OrderedList>
        </Box>
      )}
    </Box>
  );
}

export default MoleGame;
