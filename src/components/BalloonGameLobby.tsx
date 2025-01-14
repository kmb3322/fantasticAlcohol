// src/components/BalloonGameLobby.tsx
import { ArrowForwardIcon } from '@chakra-ui/icons';
import {
    Box,
    Button,
    FormLabel,
    IconButton,
    Image,
    Input,
    Text
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { socket } from '../socket';
import generateRandomId from '../utils/generateRandomId';

type BalloonGameLobbyProps = {
  onJoinedRoom: (roomCode: string, isHost: boolean) => void;
};

function BalloonGameLobby({ onJoinedRoom }: BalloonGameLobbyProps) {
  const [nickname, setNickname] = useState('');
  const [userId, setUserId] = useState('');
  const [roomCode, setRoomCode] = useState('');

  useEffect(() => {
    setUserId(generateRandomId());

    const handleJoinError = (msg: string) => {
      alert(msg);
    };
    socket.on('joinError', handleJoinError);

    const handleRoomCreated = ({ roomCode }: { roomCode: string }) => {
      onJoinedRoom(roomCode, true);
    };
    socket.on('balloon:roomCreated', handleRoomCreated);

    return () => {
      socket.off('joinError', handleJoinError);
      socket.off('balloon:roomCreated', handleRoomCreated);
    };
  }, [onJoinedRoom]);

  const handleCreateRoom = () => {
    if (!nickname.trim()) {
      alert('닉네임을 입력하세요.');
      return;
    }
    socket.emit('balloon:createRoom', { userId, nickname });
  };

  const handleJoinRoom = () => {
    if (!nickname.trim()) {
      alert('닉네임을 입력하세요.');
      return;
    }
    if (!roomCode.trim()) {
      alert('방 코드를 입력하세요.');
      return;
    }
    socket.emit('balloon:joinRoom', { roomCode, userId, nickname });
    onJoinedRoom(roomCode, false);
  };

  return (
    <Box
      w="100%"
      minH="100vh"
      bg="#f9f9f9"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      p="30px"
      boxSizing="border-box"
      fontFamily="Noto Sans KR"
    >
      {/* 로고 & 타이틀 영역 수정 필요 시 변경 */}
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        textAlign="center"
        mb="70px"
      >
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
        <Text fontSize="14px" color="#666">
          최대한 크게 풍선을 불어주세요!
        </Text>
      </Box>

      {/* 닉네임 입력 영역 */}
      <Box display="flex" flexDirection="column" mb="50px">
        <FormLabel mb="8px" ml="-24px" fontWeight="bold" fontSize="15px" color="#333">
          나의 닉네임
        </FormLabel>
        <Input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="닉네임을 입력하세요"
          w="196px"
          h="37px"
          px="15px"
          borderRadius="20px"
          border="none"
          bg="#FFF"
          boxShadow="0px 2px 13.7px 0px rgba(0, 0, 0, 0.10)"
        />
      </Box>

      {/* 방 입장 영역 */}
      <Box display="flex" flexDirection="column" mb="24px">
        <FormLabel mb="8px" fontWeight="bold" fontSize="15px" color="#333">
          개설된 방에 참여하기
        </FormLabel>
        <Box display="flex" gap="8px" alignItems="center">
          <Input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            placeholder="6자리 코드 입력하기"
            w="196px"
            h="37px"
            px="15px"
            borderRadius="20px"
            border="none"
            bg="#FFF"
            boxShadow="0px 2px 13.7px 0px rgba(0, 0, 0, 0.10)"
          />
          <IconButton
            aria-label="방 참여"
            icon={<ArrowForwardIcon color="white" />}
            onClick={handleJoinRoom}
            w="37px"
            h="37px"
            bg="#14ACA4"
            borderRadius="full"
            boxShadow="0px 2px 13.7px 0px rgba(0, 0, 0, 0.10)"
            _hover={{ bg: '#12a298' }}
          />
        </Box>
      </Box>

      {/* 새 방 개설하기 버튼 */}
      <Box display="flex" flexDirection="column" mt="40px">
        <FormLabel ml="-25px" mb="8px" fontWeight="bold" fontSize="15px" color="#333">
          또는,
        </FormLabel>
        <Button
          onClick={handleCreateRoom}
          w="195px"
          h="52px"
          borderRadius="20px"
          bg="#14ACA4"
          boxShadow="0px 2px 13.7px 0px rgba(0, 0, 0, 0.10)"
          color="#FFF"
          fontWeight="bold"
          fontSize="15px"
          cursor="pointer"
          mb="24px"
          _hover={{ bg: '#12a298' }}
        >
          새로운 방 개설하기
        </Button>
      </Box>
    </Box>
  );
}

export default BalloonGameLobby;
