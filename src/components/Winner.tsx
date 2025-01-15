// src/components/Winner.tsx
import {
  Box,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { Wheel } from 'react-custom-roulette';
import { useNavigate } from 'react-router-dom';
import { useRouletteContext } from '../context/RouletteContext';

interface SegmentData {
  option: string;
}

const Winner: React.FC = () => {
  const { playerCount } = useRouletteContext();
  console.log('Winner mounted, playerCount:', playerCount);
  const navigate = useNavigate();

  // segments를 즉시 초기화
  const [segments, setSegments] = useState<SegmentData[]>(() =>
    Array.from({ length: playerCount }, (_, i) => ({
      option: `${i + 1}번`,
    }))
  );

  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [result, setResult] = useState<string | null>(null);

  // 이름 변경 모달 상태
  const { isOpen: isNameModalOpen, onOpen: onNameModalOpen, onClose: onNameModalClose } = useDisclosure();
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState<number | null>(null);
  const [newName, setNewName] = useState<string>('');

  // 결과 팝업 모달 상태
  const { isOpen: isResultModalOpen, onOpen: onResultModalOpen, onClose: onResultModalClose } = useDisclosure();

  useEffect(() => {
    console.log('Effect running, playerCount:', playerCount);
    if (playerCount <= 0) {
      console.log('Redirecting due to invalid playerCount');
      navigate('/roulette');
      return;
    }

    // playerCount가 변경될 때만 segments 업데이트
    setSegments(
      Array.from({ length: playerCount }, (_, i) => ({
        option: `${i + 1}번`,
      }))
    );
  }, [playerCount, navigate]);

  // segments가 비어있으면 로딩 표시
  if (segments.length === 0) {
    return <Box textAlign="center" mt={10}>Loading...</Box>;
  }

  const handleChangeName = (index: number) => {
    setCurrentSegmentIndex(index);
    setNewName(segments[index].option);
    onNameModalOpen();
  };

  const handleNameSave = () => {
    if (currentSegmentIndex !== null && newName.trim() !== '') {
      setSegments((prev) =>
        prev.map((segment, i) =>
          i === currentSegmentIndex ? { option: newName.trim() } : segment
        )
      );
      onNameModalClose();
    }
  };

  const handleStart = () => {
    setResult(null);
    // 0 ~ (segments.length-1) 사이 랜덤 인덱스
    const randomIndex = Math.floor(Math.random() * segments.length);
    setPrizeNumber(randomIndex);
    setMustSpin(true);
  };

  const handleStopSpin = () => {
    setMustSpin(false);
    setResult(segments[prizeNumber].option);
    onResultModalOpen();
  };

  const handleRetry = () => {
    setResult(null);
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
      <Box display="flex"
        flexDirection="column"
        alignItems="center"
        textAlign="center"
        mb="70px">
        <Text fontWeight={700} fontSize="28px" opacity={0.8} mb="-2px">당첨 룰렛</Text>
        <Text fontSize="14px" color="#666" textAlign="center">
          나만 아니면 돼~! 과연 오늘의 주인공은?<br />룰렛판에 각자의 이름을 적어주세요
        </Text>
      </Box>

      {/* 룰렛 표시 */}
      <Box display="inline-block" mb={4}>
        <Wheel
          mustStartSpinning={mustSpin}
          prizeNumber={prizeNumber}
          data={segments}
          onStopSpinning={handleStopSpin}
          backgroundColors={['#FFD5BA', '#F19C7A', '#6E6464', '#87C6BC', '#C5EDE2']}
          textColors={['#ffffff']}
        />
      </Box>

      {/* 영역 이름 변경 버튼 */}
      <Box mb="70px">
        {segments.map((seg, i) => (
          <Button
            key={i}
            size="sm"
            m={1}
            onClick={() => handleChangeName(i)}
          >
            {seg.option}
          </Button>
        ))}
      </Box>

      {!result && (
        <Button bg="#F19C7A"
          w="195px"
          // h="52px"
          borderRadius="20px"
          color="white"
          _hover={{ bg: "#e58c63" }}
          _active={{ bg: "#d16f46" }}
          onClick={handleStart}>
          돌리기
        </Button>
      )}

      {/* 이름 변경 모달 */}
      <Modal isOpen={isNameModalOpen} onClose={onNameModalClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>이름 변경</ModalHeader>
          <ModalBody>
            <Text mb={2}>새로운 이름을 입력해주세요:</Text>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="새 이름"
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onNameModalClose}>
              취소
            </Button>
            <Button colorScheme="blue" onClick={handleNameSave}>
              저장
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 결과 팝업 모달 */}
      <Modal isOpen={isResultModalOpen} onClose={onResultModalClose} isCentered>
        <ModalOverlay />
        <ModalContent p={4} borderRadius="15px">
          <ModalBody>
            <Box mb="30px">
              <Text fontSize="18px" fontWeight={600} textAlign="center" whiteSpace="pre-line">
                🎉축하합니다!🎉
              </Text>
            </Box>
            <Box mb="30px">
              <Text fontSize="24px" fontWeight={800} textAlign="center">
                당첨: {result}
              </Text>
            </Box>
          </ModalBody>
          <ModalFooter justifyContent="space-around">
            <Button variant="outline" size="lg" onClick={() => { handleRetry(); onResultModalClose(); }}>
              다시하기
            </Button>
            <Button 
            variant="solid"
            bg="#F19C7A"
            color="white"
            _hover={{ bg: "#e58c63" }}
            _active={{ bg: "#d16f46" }}
            size="lg"
            onClick={() => { navigate('/'); onResultModalClose(); }}>
              게임 종료
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Winner;
