import { Box, Button, FormLabel, Image, Select, Text, VStack, HStack } from '@chakra-ui/react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRouletteContext } from '../context/RouletteContext';

const RouletteGameLobby: React.FC = () => {
  const navigate = useNavigate();
  const { rouletteType, setRouletteType, playerCount, setPlayerCount } = useRouletteContext();

  const handleStart = () => {
    if (rouletteType === '당첨 룰렛') {
      navigate('/roulette/winner');
    } else {
      navigate('/roulette/russian');
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
        mb="50px"
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
        
        <HStack spacing={4} w="100%" maxW="300px">
          {/* 당첨 룰렛 버튼 */}
          <Button
            w="150px"
            h="150px"
            onClick={() => setRouletteType('당첨 룰렛')}
            bg="white"
            border="1px solid"
            borderColor={rouletteType === '당첨 룰렛' ? "#F19C7A" : "gray.200"}
            borderRadius="xl"
            _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
            transition="all 0.2s"
          >
            <VStack>
              <Image
                src="/roulette.png"
                alt="당첨 룰렛"
                w="55px"
                mb={-1}
              />
              <Text fontWeight={600} color="#F19C7A">
                당첨 룰렛
              </Text>
              <Text fontSize="12px" fontWeight={250} color="gray.500">
                한 명만 당첨!
              </Text>
            </VStack>
          </Button>

          {/* 러시안 룰렛 버튼 */}
          <Button
            w="150px"
            h="150px"
            onClick={() => setRouletteType('러시안 룰렛')}
            bg="white"
            border="1px solid"
            borderColor={rouletteType === '러시안 룰렛' ? "#F19C7A" : "gray.200"}
            borderRadius="xl"
            _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
            transition="all 0.2s"
          >
            <VStack>
              <Image
                src="/russian.png"
                alt="러시안 룰렛"
                w="55px"
                mb={-1}
              />
              <Text fontWeight={600} color="#F19C7A">
                러시안 룰렛
              </Text>
              <Text fontSize="12px" fontWeight={250} color="gray.500">
                순서대로 술을 채우고<br/>
                방아쇠 당기기!
              </Text>
            </VStack>
          </Button>
        </HStack>
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
