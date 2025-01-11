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
import { useEffect, useState } from 'react';
import { socket } from '../socket';

// 채팅 메시지 형태
interface IChatMessage {
  nickname: string;
  message: string;
}

// 컴포넌트 Props
interface MoleGameWaitingProps {
  isHost: boolean;
  startGameError: string;
  onStartGame: () => void;
}

/**
 * 방장이 게임을 시작하기 전, 사람들을 기다리는 상태를 보여주고
 * 채팅 기능을 제공하는 컴포넌트
 */
function MoleGameWaiting({ isHost, startGameError, onStartGame }: MoleGameWaitingProps) {
  // 채팅 메시지 리스트
  const [chatMessages, setChatMessages] = useState<IChatMessage[]>([]);
  // 현재 작성 중인 메시지
  const [message, setMessage] = useState('');

  const toast = useToast();

  // 반응형 높이 값 예시 (모바일 / PC 환경 고려)
  const chatBoxHeight = useBreakpointValue({ base: '200px', md: '300px' });

  // 소켓 이벤트 리스너 등록
  useEffect(() => {
    // 서버에서 채팅 메시지를 받을 때
    const handleChatMessage = (data: IChatMessage) => {
      setChatMessages((prev) => [...prev, data]);
    };

    socket.on('mole:chatMessage', handleChatMessage);

    return () => {
      socket.off('mole:chatMessage', handleChatMessage);
    };
  }, []);

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
    // 서버로 메시지 emit
    socket.emit('mole:sendChatMessage', message);
    setMessage('');
  };

  return (
    <VStack
      spacing={4}
      align="stretch"
      w="full"
      maxW="sm"       // 모바일 환경 고려하여 최대 너비 설정
      mx="auto"
      p={4}
    >
      {/* 게임 시작 / 대기 안내 */}
      {isHost ? (
        <Button colorScheme="teal" onClick={onStartGame} w="full">
          게임 시작
        </Button>
      ) : (
        <Text textAlign="center">방장이 시작하기를 기다리는 중...</Text>
      )}
      {/* 방장만 게임을 시작할 수 없을 때 에러 표시 */}
      {startGameError && <Text color="red.500">{startGameError}</Text>}
      <Text fontSize="sm" color="gray.500">
        (최소 3명 이상 필요)
      </Text>

      {/* 채팅 메시지 표시 영역 */}
      <Box
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
          onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
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
