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
  

  
  interface BalloonGameWaitingProps {
    isHost: boolean;
    startGameError: string;
    onStartGame: () => void;
  }
  
  function BalloonGameWaiting({ isHost, startGameError, onStartGame }: BalloonGameWaitingProps) {
    const [chatMessages, setChatMessages] = useState<IChatMessage[]>([]);
    const [message, setMessage] = useState('');
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
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
  

  

  
      const handleGameEnded = (sortedPlayers: any[]) => {
        // 게임 종료 처리 로직 구현
        console.log('게임 종료, 결과:', sortedPlayers);
      };
      socket.on('balloon:gameEnded', handleGameEnded);
  
      return () => {
        socket.off('balloon:chatMessage', handleChatMessage);
        socket.off('balloon:timeUpdate', handleTimeUpdate);

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

  
    return (
      <VStack spacing={4} align="stretch" w="full" maxW="sm" mx="auto" p={4}>
        {isHost ? (
          <Button mt={-5} colorScheme="teal" onClick={onStartGame} w="full">
            게임 시작
          </Button>
        ) : (
          <Text textAlign="center">방장이 시작하기를 기다리는 중...</Text>
        )}
        {startGameError && <Text color="red.500">{startGameError}</Text>}

  
        {/* 게임 타이머 표시 */}
        {timeLeft !== null && (
          <Text fontSize="lg" fontWeight="bold">남은 시간: {timeLeft}초</Text>
        )}
  

  
   
  
        {/* 채팅 영역 */}
        <Box
        ref={chatBoxRef}
        borderWidth="1px"
        borderRadius={12}
        p={4}
        bg="#FFF"
        h={chatBoxHeight}
        overflowY="auto"
        boxShadow="0px 2px 13.7px 0px rgba(0, 0, 0, 0.10)"
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
        {/* 메시지 입력 & 전송 UI */}
      <HStack spacing={2}>
        <Input
          placeholder="메시지를 입력하세요..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          flex="1"
          borderRadius="20px"
            border="none"
            bg="#FFF"
            boxShadow="0px 2px 13.7px 0px rgba(0, 0, 0, 0.10)"
        />
        <Button boxShadow="0px 2px 13.7px 0px rgba(0, 0, 0, 0.10)" color="#FFF" bg="#14ACA4" onClick={handleSendChat}>
          전송
        </Button>
      </HStack>
      </VStack>
    );
  }
  
  export default BalloonGameWaiting;
  