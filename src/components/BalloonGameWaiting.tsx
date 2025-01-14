// src/components/BalloonGameWaiting.tsx
import {
    Box,
    Button,
    HStack,
    Input,
    Text,
    useBreakpointValue,
    useToast,
    VStack,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { socket } from '../socket';
  
  interface IChatMessage {
    nickname: string;
    message: string;
  }
  
  interface IBalloonStatus {
    socketId: string;
    balloonSize?: number;
    popped?: boolean;
  }
  
  interface BalloonGameWaitingProps {
    isHost: boolean;
    startGameError: string;
    onStartGame: () => void;
  }
  
  function BalloonGameWaiting({ isHost, startGameError, onStartGame }: BalloonGameWaitingProps) {
    const [chatMessages, setChatMessages] = useState<IChatMessage[]>([]);
    const [message, setMessage] = useState('');
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [balloonStatuses, setBalloonStatuses] = useState<Record<string, IBalloonStatus>>({});
    const toast = useToast();
  
    const chatBoxRef = useRef<HTMLDivElement | null>(null);
    const chatBoxHeight = useBreakpointValue({ base: '200px', md: '300px' });
  
    useEffect(() => {
      const handleChatMessage = (data: IChatMessage) => {
        setChatMessages((prev) => [...prev, data]);
      };
      socket.on('balloon:chatMessage', handleChatMessage);
  
      const handleTimeUpdate = (time: number) => {
        setTimeLeft(time);
      };
      socket.on('balloon:timeUpdate', handleTimeUpdate);
  
      const handleSizeUpdate = ({ socketId, balloonSize }: IBalloonStatus) => {
        setBalloonStatuses(prev => ({
          ...prev,
          [socketId]: { ...prev[socketId], balloonSize, popped: false }
        }));
      };
      socket.on('balloon:sizeUpdate', handleSizeUpdate);
  
      const handlePopped = ({ socketId, nickname }: { socketId: string, nickname: string }) => {
        setBalloonStatuses(prev => ({
          ...prev,
          [socketId]: { ...prev[socketId], popped: true }
        }));
        toast({
            title: `${nickname}의 풍선이 터졌습니다!`,
            status: 'info',
            isClosable: true,
            duration: 2000,
          });
        // 추가적인 팝업 또는 UI 효과 처리 가능
      };
      socket.on('balloon:popped', handlePopped);
  
      const handleGameEnded = (sortedPlayers: any[]) => {
        // 게임 종료 처리 로직 구현
        console.log('게임 종료, 결과:', sortedPlayers);
      };
      socket.on('balloon:gameEnded', handleGameEnded);
  
      return () => {
        socket.off('balloon:chatMessage', handleChatMessage);
        socket.off('balloon:timeUpdate', handleTimeUpdate);
        socket.off('balloon:sizeUpdate', handleSizeUpdate);
        socket.off('balloon:popped', handlePopped);
        socket.off('balloon:gameEnded', handleGameEnded);
      };
    }, []);
  
    useEffect(() => {
      if (chatBoxRef.current) {
        chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
      }
    }, [chatMessages]);
  
    const handleSendChat = () => {
      if (!message.trim()) {
        toast({
          title: '메시지를 입력하세요.',
          status: 'warning',
          isClosable: true,
          duration: 2000,
        });
        return;
      }
      socket.emit('balloon:sendChatMessage', message);
      setMessage('');
    };
  
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.nativeEvent.isComposing) return;
      if (e.key === 'Enter') {
        handleSendChat();
      }
    };
  
    const handleBlow = () => {
      socket.emit('balloon:blow');
    };
  
    return (
      <VStack spacing={4} align="stretch" w="full" maxW="sm" mx="auto" p={4}>
        {isHost ? (
          <Button colorScheme="teal" onClick={onStartGame} w="full">
            게임 시작
          </Button>
        ) : (
          <Text textAlign="center">방장이 시작하기를 기다리는 중...</Text>
        )}
        {startGameError && <Text color="red.500">{startGameError}</Text>}
        <Text fontSize="sm" color="gray.500">
          (최소 2명, 최대 8명이 함께 플레이 가능합니다.)
        </Text>
  
        {/* 게임 타이머 표시 */}
        {timeLeft !== null && (
          <Text fontSize="lg" fontWeight="bold">남은 시간: {timeLeft}초</Text>
        )}
  
        {/* 풍선 불기 버튼 */}
        <Button colorScheme="pink" onClick={handleBlow}>
          바람 불기
        </Button>
  
        {/* 풍선 상태 목록 (간단한 예시) */}
        <Box borderWidth="1px" borderRadius="md" p={2}>
          {Object.entries(balloonStatuses).map(([id, status]) => (
            <Text key={id}>
              {id}: {status.popped ? '터짐' : `크기 ${status.balloonSize || 0}`}
            </Text>
          ))}
        </Box>
  
        {/* 채팅 영역 */}
        <Box
          ref={chatBoxRef}
          borderWidth="1px"
          borderRadius="md"
          p={2}
          h={chatBoxHeight}
          overflowY="auto"
        >
          {chatMessages.map((chat, idx) => (
            <Box key={idx} mb={1}>
              <Text as="span" fontWeight="bold">
                {chat.nickname}:{' '}
              </Text>
              <Text as="span">{chat.message}</Text>
            </Box>
          ))}
        </Box>
        <HStack spacing={2}>
          <Input
            placeholder="메시지를 입력하세요..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            flex="1"
          />
          <Button colorScheme="blue" onClick={handleSendChat}>
            전송
          </Button>
        </HStack>
      </VStack>
    );
  }
  
  export default BalloonGameWaiting;
  