import React, { useState } from 'react';
import { Box, VStack, Slider, SliderTrack, SliderFilledTrack, SliderThumb, Text, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@chakra-ui/react';

const Ratio: React.FC = () => {
  const [players, setPlayers] = useState<string[]>(['1번', '2번', '3번', '4번']);
  const [ratios, setRatios] = useState<number[]>([25, 25, 25, 25]);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const handleSpin = () => {
    setIsSpinning(true);
    setTimeout(() => {
      const total = ratios.reduce((sum, ratio) => sum + ratio, 0);
      const random = Math.random() * total;
      let cumulative = 0;
      let winner = '';
      for (let i = 0; i < ratios.length; i++) {
        cumulative += ratios[i];
        if (random < cumulative) {
          winner = players[i];
          break;
        }
      }
      setSelectedPlayer(winner);
      setIsSpinning(false);
    }, 3000);
  };

  const handleRatioChange = (index: number, value: number) => {
    const updatedRatios = [...ratios];
    updatedRatios[index] = value;
    setRatios(updatedRatios);
  };

  return (
    <VStack spacing={6} p={8}>
      <Box
        position="relative"
        w="300px"
        h="300px"
        borderRadius="50%"
        bg="gray.200"
        border="2px solid black"
      >
        {players.map((player, index) => (
          <Box
            key={index}
            position="absolute"
            w="50%"
            h="50%"
            transform={`rotate(${(index * 360) / players.length}deg)`}
            transformOrigin="100% 100%"
            bg="orange.300"
          >
            <Text
              position="absolute"
              w="100%"
              h="100%"
              display="flex"
              justifyContent="center"
              alignItems="center"
              transform="rotate(-90deg)"
            >
              {player}: {ratios[index]}%
            </Text>
          </Box>
        ))}
      </Box>
      {players.map((player, index) => (
        <VStack key={index} w="80%">
          <Text>{player}</Text>
          <Slider
            value={ratios[index]}
            onChange={(value) => handleRatioChange(index, value)}
            min={0}
            max={100}
            step={5}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
        </VStack>
      ))}
      <Button colorScheme="orange" onClick={handleSpin} isLoading={isSpinning}>
        시작하기
      </Button>
      {selectedPlayer && (
        <Modal isOpen={!!selectedPlayer} onClose={() => setSelectedPlayer(null)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>비율 룰렛 결과</ModalHeader>
            <ModalBody>
              <Text fontSize="xl">축하합니다! 당첨자: {selectedPlayer}</Text>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" onClick={() => setSelectedPlayer(null)}>
                다시하기
              </Button>
              <Button colorScheme="red" ml={3}>
                종료
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </VStack>
  );
};

export default Ratio;
