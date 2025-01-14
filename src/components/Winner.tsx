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
    <Box textAlign="center" mt={10}>
      <Text fontSize="2xl" fontWeight="bold" mb={4}>당첨 룰렛</Text>
      <Text fontSize="14px" color="#666" textAlign="center">
      나만 아니면 돼~! 과연 오늘의 주인공은?<br/>룰렛판에 각자의 이름을 적어주세요
        </Text>

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
      <Box mb={4}>
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
        <ModalContent>
          <ModalHeader>당첨 결과</ModalHeader>
          <ModalBody>
            <Text fontSize="xl" fontWeight="bold" mb={2}>
              당첨: {result}
            </Text>
            <Text color="green.500">축하합니다!</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={2} onClick={() => { handleRetry(); onResultModalClose(); }}>
              다시하기
            </Button>
            <Button onClick={() => { navigate('/'); onResultModalClose(); }}>
              게임 종료
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Winner;
