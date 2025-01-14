import { Box, Button, FormLabel, Image, Select, Text } from '@chakra-ui/react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRouletteContext } from '../context/RouletteContext';

const RouletteGameLobby: React.FC = () => {
  const navigate = useNavigate();
  const { rouletteType, setRouletteType, playerCount, setPlayerCount } = useRouletteContext();

  const handleStart = () => {
    if (rouletteType === '당첨 룰렛') {
      navigate('/random/roulette');
    } else {
      navigate('/random/ladder');
    }
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
          src="/roulette.png"
          alt="roulette logo"
        />
        <Text fontWeight={700} fontSize="28px" opacity={0.8} mb="-2px">룰렛 게임</Text>
        <Text fontSize="14px" color="#666" textAlign="center">
          목적에 따라 아래의 항목을 선택 후 진행해주세요
        </Text>
      </Box>
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
          랜덤 유형
        </FormLabel>
        <Select
          mb={4}
          w="196px"
          h="37px"
          borderRadius="full"
          border="none"
          bg="#FFF"
          boxShadow="0px 2px 13.7px 0px rgba(0, 0, 0, 0.10)"
          value={rouletteType}
          onChange={(e) => setRouletteType(e.target.value as '당첨 룰렛' | '비율 룰렛')}
        >
          <option value="당첨 룰렛">당첨 룰렛</option>
          <option value="비율 룰렛">사다리타기</option>
        </Select>
      </Box>
      <Box
        display="flex"
        flexDirection="column"
        mb="60px"
      >
        <FormLabel
          mb="8px"
          ml="-24px"
          fontWeight="bold"
          fontSize="15px"
          color="#333"
        >
          참가 인원 수
        </FormLabel>
        <Select
          mb={4}
          w="196px"
          h="37px"
          borderRadius="full"
          border="none"
          bg="#FFF"
          boxShadow="0px 2px 13.7px 0px rgba(0, 0, 0, 0.10)"
          value={playerCount}
          onChange={(e) => setPlayerCount(Number(e.target.value))}
        >
          {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
            <option key={num} value={num}>{num}명</option>
          ))}
        </Select>
      </Box>
      <Button
        bg="#F19C7A"
        w="195px"
        h="52px"
        borderRadius="20px"
        boxShadow="0px 2px 13.7px 0px rgba(0, 0, 0, 0.10)"
        color="#FFF"
        fontWeight="bold"
        fontSize="15px"
        _hover={{ bg: "#e58c63" }}
        _active={{ bg: "#d16f46" }}
        onClick={handleStart}>
        시작하기
      </Button>
      {/* </Box> */}
    </Box>
  );
};

export default RouletteGameLobby;
