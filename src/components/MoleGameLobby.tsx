// MoleGameLobby.tsx
import { ArrowForwardIcon } from '@chakra-ui/icons'; // Chakra 아이콘
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

type MoleGameLobbyProps = {
  onJoinedRoom: (roomCode: string, isHost: boolean) => void;
};

function MoleGameLobby({ onJoinedRoom }: MoleGameLobbyProps) {
  const [nickname, setNickname] = useState('');
  const [userId, setUserId] = useState('');
  const [roomCode, setRoomCode] = useState('');

  // 플레이어 목록(로비에서 확인용)
  const [playerList, setPlayerList] = useState<any[]>([]);

  useEffect(() => {
    // 유저 ID 생성
    setUserId(generateRandomId());

    // playerList 이벤트 수신
    const handlePlayerList = (players: any[]) => {
      setPlayerList(players);
    };
    socket.on('mole:playerList', handlePlayerList);

    // joinError 수신
    const handleJoinError = (msg: string) => {
      alert(msg);
    };
    socket.on('joinError', handleJoinError);

    // roomCreated (방 생성 완료)
    const handleRoomCreated = ({ roomCode }: { roomCode: string }) => {
      // 방장으로서의 진입
      onJoinedRoom(roomCode, true);
    };
    socket.on('mole:roomCreated', handleRoomCreated);

    return () => {
      socket.off('mole:playerList', handlePlayerList);
      socket.off('joinError', handleJoinError);
      socket.off('mole:roomCreated', handleRoomCreated);
    };
  }, [onJoinedRoom]);

  // 새 방 만들기
  const handleCreateRoom = () => {
    if (!nickname.trim()) {
      alert('닉네임을 입력하세요.');
      return;
    }
    socket.emit('mole:createRoom', { userId, nickname });
  };

  // 기존 방 입장
  const handleJoinRoom = () => {
    if (!nickname.trim()) {
      alert('닉네임을 입력하세요.');
      return;
    }
    if (!roomCode.trim()) {
      alert('방 코드를 입력하세요.');
      return;
    }
    socket.emit('mole:joinRoom', { roomCode, userId, nickname });
    // 이 시점에서 방장 여부는 알 수 없으므로 false
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
      {/* 로고 & 타이틀 영역 */}
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
          src="/cat.png"
          alt="cat logo"
        />
        <Text fontWeight={700} fontSize="28px" opacity={0.8} mb="-2px">
          고양이 잡기
        </Text>
        <Text fontSize="14px" color="#666">
          장난꾸러기 고양이를 혼쭐내주세요!
        </Text>
      </Box>

      {/* 닉네임 입력영역 */}
      <Box
        display="flex"
        flexDirection="column"
        mb="50px"
      >
        <FormLabel
          mb="8px"
          ml="-24px"
          fontWeight="bold"
          fontSize="15px"
          color="#333"
        >
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

      {/* 방 입장 영역 (개설된 방에 참여하기) */}
      <Box
        display="flex"
        flexDirection="column"
        mb="24px"
      >
        <FormLabel
          mb="8px"
          fontWeight="bold"
          fontSize="15px"
          color="#333"
        >
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
      <Box
        display="flex"
        flexDirection="column"
        mt="40px"
        >
      <FormLabel
          ml="-25px"
          mb="8px"
          fontWeight="bold"
          fontSize="15px"
          color="#333"
        >
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

export default MoleGameLobby;
