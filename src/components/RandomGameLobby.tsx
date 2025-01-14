import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRouletteContext } from '../context/RouletteContext';
import { Box, Button, Select, Text, VStack } from '@chakra-ui/react';

const RandomGameLobby: React.FC = () => {
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
    <VStack spacing={20} p={4} align="center">
      {/* <Box maxW="400px" mx="auto" mt={10} p={4} borderWidth="1px" borderRadius="md"> */}
      <Box>
        <Text fontSize="xl" mb={4} fontWeight="bold" textAlign="center">룰렛 게임</Text>
        <Text fontSize="14px" color="#666" textAlign="center">
          목적에 따라 아래의 항목을 선택 후 진행해주세요
        </Text>
      </Box>
      <VStack spacing={0} p={4} align="start">
      <Text mb={2}>랜덤 유형</Text>
      <Select
        mb={4}
        width="300px"
        borderRadius="full"
        value={rouletteType}
        onChange={(e) => setRouletteType(e.target.value as '당첨 룰렛' | '비율 룰렛')}
      >
        <option value="당첨 룰렛">당첨 룰렛</option>
        <option value="비율 룰렛">사다리타기</option>
      </Select>
      </VStack>
      <VStack spacing={0} p={4} align="start">
      <Text mb={2}>참가 인원 수</Text>
      <Select
        mb={4}
        width="300px"
        borderRadius="full"
        value={playerCount}
        onChange={(e) => setPlayerCount(Number(e.target.value))}
      >
        {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
          <option key={num} value={num}>{num}명</option>
        ))}
      </Select>
      </VStack>
      <Button bg="#F19C7A"
        color="white"
        _hover={{ bg: "#e58c63" }}
        _active={{ bg: "#d16f46" }}
        onClick={handleStart}>
        시작하기
      </Button>
      {/* </Box> */}
    </VStack>
  );
};

export default RandomGameLobby;
