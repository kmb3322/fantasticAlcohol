import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRouletteContext } from '../context/RouletteContext';
import { Box, Button, Select, Text } from '@chakra-ui/react';

const RouletteGameLobby: React.FC = () => {
  const navigate = useNavigate();
  const { rouletteType, setRouletteType, playerCount, setPlayerCount } = useRouletteContext();

  const handleStart = () => {
    if (rouletteType === '당첨 룰렛') {
      navigate('/roulette/winner');
    } else {
      navigate('/roulette/ratio');
    }
  };

  return (
    <Box maxW="400px" mx="auto" mt={10} p={4} borderWidth="1px" borderRadius="md">
      <Text fontSize="xl" mb={4} fontWeight="bold">룰렛 게임 로비</Text>

      <Text mb={2}>룰렛 유형 선택</Text>
      <Select
        mb={4}
        value={rouletteType}
        onChange={(e) => setRouletteType(e.target.value as '당첨 룰렛' | '비율 룰렛')}
      >
        <option value="당첨 룰렛">당첨 룰렛</option>
        <option value="비율 룰렛">비율 룰렛</option>
      </Select>

      <Text mb={2}>참가 인원 수</Text>
      <Select
        mb={4}
        value={playerCount}
        onChange={(e) => setPlayerCount(Number(e.target.value))}
      >
        {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
          <option key={num} value={num}>{num}명</option>
        ))}
      </Select>

      <Button colorScheme="teal" onClick={handleStart}>
        시작하기
      </Button>
    </Box>
  );
};

export default RouletteGameLobby;
