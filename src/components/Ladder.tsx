import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  keyframes,
} from "@chakra-ui/react";
import { useRouletteContext } from "../context/RouletteContext";

// 사다리 가로선이 생기는 애니메이션 (원하는 대로 커스텀 가능)
const drawLine = keyframes`
  0% {
    width: 0;
  }
  100% {
    width: 100%;
  }
`;

const Ladder: React.FC = () => {
  const { playerCount } = useRouletteContext(); // 참가 인원 가져오기
  const [names, setNames] = useState<string[]>([]); // 참가자 이름
  const [results, setResults] = useState<string[]>([]); // 결과 값
  const [ladder, setLadder] = useState<boolean[][]>([]); // 사다리 구조 (true이면 가로줄 존재)
  const [finalMapping, setFinalMapping] = useState<{ [key: string]: string }>(
    {}
  ); // 최종 매칭 결과
  const [isStarted, setIsStarted] = useState(false); // 사다리 실행 여부
  const [isResultModalOpen, setIsResultModalOpen] = useState(false); // 결과 모달 상태

  // 참가 인원 변경 시 names와 results 배열 동적으로 조정
  useEffect(() => {
    setNames((prevNames) => {
      const updatedNames = [...prevNames];
      while (updatedNames.length < playerCount) {
        updatedNames.push(`${updatedNames.length + 1}번`);
      }
      while (updatedNames.length > playerCount) {
        updatedNames.pop();
      }
      return updatedNames;
    });

    setResults((prevResults) => {
      const updatedResults = [...prevResults];
      while (updatedResults.length < playerCount) {
        updatedResults.push(`결과 ${updatedResults.length + 1}`);
      }
      while (updatedResults.length > playerCount) {
        updatedResults.pop();
      }
      return updatedResults;
    });
  }, [playerCount]);

  // 사다리 생성 함수
  const generateLadder = () => {
    const steps = 5; // 사다리 단계 수 (적절히 조절 가능)
    const generatedLadder = Array.from({ length: steps }, () =>
      Array.from({ length: playerCount - 1 }, () => Math.random() > 0.5)
    );
    setLadder(generatedLadder);
  };

  // 사다리 결과 계산
  const calculateResults = () => {
    const shuffledResults = [...results];
    shuffledResults.sort(() => Math.random() - 0.5); // 결과를 랜덤으로 섞음

    const mapping: { [key: string]: string } = {};
    names.forEach((name, index) => {
      mapping[name] = shuffledResults[index];
    });

    setFinalMapping(mapping);
    setIsResultModalOpen(true);
  };

  // 게임 시작
  const startGame = () => {
    setIsStarted(true);
    generateLadder();
    setTimeout(() => {
      calculateResults();
      setIsStarted(false);
    }, 3000); // 3초 후 결과 계산
  };

  // 이름 수정 핸들러
  const handleNameChange = (index: number, newName: string) => {
    const updatedNames = [...names];
    updatedNames[index] = newName;
    setNames(updatedNames);
  };

  return (
    <Box textAlign="center" mt={10}>
      <Text fontSize="2xl" fontWeight="bold" mb={4}>
        사다리 타기
      </Text>

      {/* 참가자 이름 입력 */}
      <VStack spacing={3} mb={6}>
        {names.map((name, index) => (
          <HStack key={index}>
            <Input
              value={name}
              onChange={(e) => handleNameChange(index, e.target.value)}
              placeholder={`참가자 ${index + 1}`}
              isDisabled={isStarted}
            />
          </HStack>
        ))}
      </VStack>

      {/* 시작 버튼 */}
      <Button
        colorScheme="teal"
        onClick={startGame}
        isDisabled={isStarted}
        mb={4}
      >
        시작하기
      </Button>

      {/* 사다리 애니메이션 / 스타일링 */}
      {isStarted && (
        <Box mt={6} display="inline-block">
          {ladder.map((step, stepIndex) => (
            <HStack key={stepIndex} spacing={0}>
              {step.map((isConnected, colIndex) => (
                <Box
                  key={colIndex}
                  position="relative"
                  w="40px"
                  h="40px"
                  borderLeft="2px solid"
                  borderColor="blue.400"
                  // 가로줄은 before 가상 요소로 그려줌
                  _before={{
                    content: '""',
                    position: "absolute",
                    top: "50%",
                    left: "0",
                    transform: "translateY(-50%)",
                    height: "2px",
                    width: isConnected ? "100%" : "0",
                    backgroundColor: "pink.400",
                    animation: isConnected
                      ? `${drawLine} 0.3s ease-in-out forwards`
                      : "none",
                  }}
                />
              ))}
              {/* 마지막 세로줄 */}
              <Box
                w="40px"
                h="40px"
                borderLeft="2px solid"
                borderColor="blue.400"
              />
            </HStack>
          ))}
        </Box>
      )}

      {/* 결과 모달 */}
      <Modal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>결과</ModalHeader>
          <ModalBody>
            {Object.entries(finalMapping).map(([name, result]) => (
              <Text key={name}>
                {name}: {result}
              </Text>
            ))}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={() => setIsResultModalOpen(false)}>
              확인
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Ladder;
