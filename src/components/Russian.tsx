// src/components/RussianRoulette.tsx

import {
  Box,
  Button,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  Text,
  useToast
} from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRouletteContext } from "../context/RouletteContext";

// 사운드 파일 임포트
import emptyGunshotSound from "../assets/empty-gunshot.mp3";
import realGunshotSound from "../assets/real-gunshot.mp3";

import revolverImage from "../assets/revolver.png";

const MotionImage = motion(Image);

const gunVariants = {
  idle: {
    rotate: 0,
    y: 0
  },
  empty: {
    rotate: [15, 0],
    transition: { duration: 0.3 }
  },
  real: {
    y: [0, 20, 0],
    transition: { duration: 0.3 }
  }
};

const Russian: React.FC = () => {
  const { playerCount } = useRouletteContext(); // 참가 인원 가져오기
  const [players, setPlayers] = useState<string[]>([]); // 플레이어 이름
  //const [results, setResults] = useState<string[]>([]); // 결과 값
  const [currentCount, setCurrentCount] = useState(0); // 현재 클릭 수
  const [targetNumber, setTargetNumber] = useState(0); // 목표 클릭 수
  const [isGameOver, setIsGameOver] = useState(false); // 게임 종료 여부
  const [selectedPlayer, setSelectedPlayer] = useState<string>(""); // 당첨 플레이어
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태
  const [animationType, setAnimationType] = useState<"empty" | "real" | null>(null); // 애니메이션 종류
  const toast = useToast();
  const navigate = useNavigate();

  // 사운드 객체 생성
  const emptyGunshot = new Audio(emptyGunshotSound);
  const realGunshot = new Audio(realGunshotSound);

  // 게임 초기화 함수
  const initializeGame = () => {
    // 목표 클릭 수를 1~6 사이에서 랜덤하게 설정 (러시안 룰렛 표준)
    const randomTarget = Math.floor(Math.random() * playerCount) + 1;
    setTargetNumber(randomTarget);
    setCurrentCount(0);
    setIsGameOver(false);
    setSelectedPlayer("");
    setAnimationType(null); // 애니메이션 초기화
    // 플레이어 수에 맞게 플레이어 이름 초기화
    setPlayers((prevPlayers) => {
      const updatedPlayers = [...prevPlayers];
      while (updatedPlayers.length < playerCount) {
        updatedPlayers.push(`플레이어 ${updatedPlayers.length + 1}`);
      }
      while (updatedPlayers.length > playerCount) {
        updatedPlayers.pop();
      }
      return updatedPlayers;
    });

    {/* 
    // 결과 값 초기화
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
*/}


  };


  // 컴포넌트 마운트 시 게임 초기화
  useEffect(() => {
    initializeGame();
  }, [playerCount]);

  // 버튼 클릭 핸들러
  const handleButtonClick = () => {
    if (isGameOver) {
      toast({
        title: "게임이 종료되었습니다.",
        description: "새로운 게임을 시작하세요.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const nextCount = currentCount + 1;

    if (nextCount === targetNumber) {
      // 진짜 총소리 재생
      realGunshot.play();
      setAnimationType("real"); // 애니메이션 타입 설정

      // 당첨 플레이어 결정
      const playerIndex = (nextCount - 1) % playerCount;
      const loser = players[playerIndex] || `플레이어 ${playerIndex + 1}`;

      setSelectedPlayer(loser);
      setIsGameOver(true);
      setIsModalOpen(true);
    } else {
      // 빈 총소리 재생
      emptyGunshot.play();
      setAnimationType("empty"); // 애니메이션 타입 설정
    }

    setCurrentCount(nextCount);

    // 애니메이션 완료 후 상태 초기화
    setTimeout(() => {
      setAnimationType(null);
    }, animationType === "real" ? 600 : 300); // 애니메이션 지속 시간과 일치시킵니다.
  };

  // 모달 닫기 핸들러
  const handleModalClose = () => {
    setIsModalOpen(false);
    initializeGame();
  };

  // 홈으로 이동하는 함수 추가
  const handleGoHome = () => {
    navigate('/');
    setIsModalOpen(false);
  };

  {/*
  // 플레이어 이름 수정 핸들러
  const handleNameChange = (index: number, newName: string) => {
    const updatedPlayers = [...players];
    updatedPlayers[index] = newName;
    setPlayers(updatedPlayers);
  };

  // 결과 수정 핸들러 (필요 시 확장 가능)
  const handleResultChange = (index: number, newResult: string) => {
    const updatedResults = [...results];
    updatedResults[index] = newResult;
    setResults(updatedResults);
  };
 */}

  return (
    <Box
      textAlign="center"
      mt={10}
      px={4}
      // height="calc(100vh - 100px)"
      display="flex"
      flexDirection="column"
      justifyContent="space-between" // 요소들 사이에 공간을 균등하게 배분
      alignItems="center"
    >
      <Box flex="1" display="flex" flexDirection="column" justifyContent="center">
        <Text fontSize="2xl" fontWeight="bold" mb={6}>
          러시안 룰렛
        </Text>
        <AnimatePresence>
          <MotionImage
            src={revolverImage}
            alt="Gun"
            maxHeight="60vh" // 뷰포트 높이의 30%로 제한
            width="auto"
            mx="auto"
            objectFit="contain"
            variants={gunVariants}
            animate={animationType || "idle"}
          />
        </AnimatePresence>
      </Box>

      {/* 현재 클릭 수 표시 */}
      <Box mb={6}>
        <Text fontSize="4xl" fontWeight="bold">
          {currentCount}
        </Text>
      </Box>

      {/* 버튼 */}
      <Button
        bg="#F19C7A"
        w="195px"
        // h="52px"
        borderRadius="20px"
        color="white"
        _hover={{ bg: "#e58c63" }}
        _active={{ bg: "#d16f46" }}
        onClick={handleButtonClick}
        isDisabled={isGameOver}
        mb={6}
      >
        방아쇠 당기기
      </Button>

      {/* 당첨자 모달 */}
      <Modal isOpen={isModalOpen} onClose={handleModalClose} isCentered>
        <ModalOverlay />
        <ModalContent p={4} borderRadius="15px">
          <ModalBody>
          <Box mb="30px">
            <Text fontSize="18px" fontWeight={600} textAlign="center" whiteSpace="pre-line">
            🎉빵!🎉
            </Text>
          </Box>
          <Box mb="30px">
          <Text fontSize="lg" textAlign="center">
              {selectedPlayer}님이 걸렸습니다!<br/>
              지금까지 따라진 술 원샷❤️
            </Text>
          </Box>
          </ModalBody>
          <ModalFooter justifyContent="space-around">
            <Button variant="outline" size="lg" onClick={handleModalClose}>
              다시 시작
            </Button>
            <Button variant="solid"
            bg="#F19C7A"
            color="white"
            _hover={{ bg: "#e58c63" }}
            _active={{ bg: "#d16f46" }}
            size="lg" onClick={handleGoHome}>
              게임 종료
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Russian;
