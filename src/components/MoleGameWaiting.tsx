// src/components/MoleGameWaiting.tsx
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
import { socket } from '../socket'; // socket.io-client import

interface IChatMessage {
  nickname: string;
  message: string;
}

interface MoleGameWaitingProps {
  isHost: boolean;
  startGameError: string;
  onStartGame: () => void;
}

function MoleGameWaiting({ isHost, startGameError, onStartGame }: MoleGameWaitingProps) {
  const [chatMessages, setChatMessages] = useState<IChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const toast = useToast();

  const chatBoxRef = useRef<HTMLDivElement | null>(null);
  const chatBoxHeight = useBreakpointValue({ base: '200px', md: '300px' });

  useEffect(() => {
    const handleChatMessage = (data: IChatMessage) => {
      setChatMessages((prev) => [...prev, data]);
    };
    socket.on('mole:chatMessage', handleChatMessage);

    return () => {
      socket.off('mole:chatMessage', handleChatMessage);
    };
  }, []);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // 메시지 전송
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
    socket.emit('mole:sendChatMessage', message);
    setMessage('');
  };

  // 한글 입력 시 마지막 글자가 중복되지 않도록 IME 조합 체크
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter') {
      handleSendChat();
    }
  };

  return (
    <VStack spacing={4} align="stretch" w="full" maxW="sm" mx="auto" p={4}>
      {/* 게임 시작 버튼 */}
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

      {/* 채팅 메시지 표시 영역 */}
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

      {/* 메시지 입력 & 전송 UI */}
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

export default MoleGameWaiting;
