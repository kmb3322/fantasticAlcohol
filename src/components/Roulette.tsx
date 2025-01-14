import React, { useRef, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Text,
} from '@chakra-ui/react';

// 파스텔 톤 랜덤색
// 예: 원하는 컬러 팔레트 배열
const PALETTE = [
  '#F8B195',
  '#F67280',
  '#C06C84',
  '#6C5B7B',
  '#355C7D',
  '#99B898',
  '#FECEAB',
  '#FF847C',
  '#E84A5F',
  '#2A363B',
];

function getPaletteColor(i: number) {
  return PALETTE[i % PALETTE.length];
}


interface RouletteProps {
  players: string[];
  onSpinComplete: (winner: string) => void;
}

const Roulette: React.FC<RouletteProps> = ({ players: initialPlayers, onSpinComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 상태
  const [players, setPlayers] = useState<string[]>(initialPlayers);
  const [rotation, setRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempText, setTempText] = useState<string>('');

  // 섹션별 색상 보관
  const [colors, setColors] = useState<string[]>([]);

  // ----------------------------------------------------
  // 1) Canvas 그리기 함수
  // ----------------------------------------------------
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cw = canvas.width / 2;
    const ch = canvas.height / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 섹션별 라디안
    const arc = (Math.PI * 2) / players.length;

    // 부채꼴 그리기
    for (let i = 0; i < players.length; i++) {
      if (!colors[i]) {
        // 파스텔 톤 색상
        colors[i] = getPaletteColor(i);
      }
      ctx.beginPath();
      ctx.fillStyle = colors[i];
      ctx.moveTo(cw, ch);
      ctx.arc(cw, ch, cw, arc * i, arc * (i + 1));
      ctx.fill();
      ctx.closePath();
    }

    // 텍스트
    ctx.fillStyle = '#fff';
    ctx.font = '18px Pretendard';
    ctx.textAlign = 'center';
    for (let i = 0; i < players.length; i++) {
      const angle = arc * i + arc / 2;
      ctx.save();
      // 텍스트 위치 = 중심 + (반지름-50)
      const tx = cw + Math.cos(angle) * (cw - 50);
      const ty = ch + Math.sin(angle) * (ch - 50);
      ctx.translate(tx, ty);
      // 텍스트가 원둘레 쪽을 보도록 돌림
      ctx.rotate(angle + Math.PI / 2);
      ctx.fillText(players[i], 0, 0);
      ctx.restore();
    }
  };

  // ----------------------------------------------------
  // 2) Canvas가 바뀔 때마다 다시 그림
  // ----------------------------------------------------
  useEffect(() => {
    drawCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players, colors]);

  // ----------------------------------------------------
  // 3) 룰렛 돌리기
  // ----------------------------------------------------
  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);

    const randomAngle = Math.floor(Math.random() * 360);
    const additionalSpins = 5 * 360; // 5바퀴
    const targetAngle = rotation + additionalSpins + randomAngle;

    setRotation(targetAngle);
    // // 1) 당첨 인덱스
    // const ran = Math.floor(Math.random() * players.length);

    // // 2) 한 섹션의 각도(도 단위)
    // const arc = 360 / players.length;

    // // 3) 최종 회전각
    // const targetAngle = (360 - arc * (ran + 1) + 3600) + (arc / 3);

    // // 4) 회전 적용
    // setRotation(targetAngle);

    setTimeout(() => {
      const finalAngle = targetAngle % 360;
      const sectionAngle = 360 / players.length;
      // (360 - finalAngle + 90) 로 보정
      let adjustedAngle = (360 - finalAngle + 90) % 360;
      const winnerIndex = Math.floor(adjustedAngle / sectionAngle);
      onSpinComplete(players[ran]);
      setIsSpinning(false);
    }, 3000);
  };

  // ----------------------------------------------------
  // 4) Canvas 클릭해서 편집 섹션 찾기
  // ----------------------------------------------------
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const cw = canvas.width / 2;
    const ch = canvas.height / 2;

    // canvas 중심(0,0) 기준 좌표
    const x = e.clientX - rect.left - cw;
    const y = e.clientY - rect.top - ch;

    // angle: -π ~ π
    let angle = Math.atan2(y, x);
    if (angle < 0) {
      angle += 2 * Math.PI;
    }

    // 섹션 라디안
    const arc = (2 * Math.PI) / players.length;
    const clickedIndex = Math.floor(angle / arc);

    // 편집 모달 열기
    setEditingIndex(clickedIndex);
    setTempText(players[clickedIndex]);
  };

  // ----------------------------------------------------
  // 5) 편집 모달에서 저장
  // ----------------------------------------------------
  const handleEditText = () => {
    if (editingIndex === null) return;
    const updated = [...players];
    updated[editingIndex] = tempText;
    setPlayers(updated);
    setEditingIndex(null);
    setTempText('');
  };

  // ----------------------------------------------------
  // Canvas 스타일 (회전 animation)
  // ----------------------------------------------------
  const canvasStyle: React.CSSProperties = {
    transform: `rotate(${rotation}deg)`,
    transition: isSpinning ? 'transform 3s ease-out' : 'none',
    cursor: 'pointer',
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" position="relative">
      {/* 삼각형 화살표 */}
      <Box
        position="absolute"
        top="-15px"
        left="50%"
        transform="translateX(-50%)"
        w="0"
        h="0"
        borderLeft="15px solid transparent"
        borderRight="15px solid transparent"
        borderTop="30px solid orange"
        zIndex="10"
      />

      {/* Canvas */}
      <Box position="relative">
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          style={canvasStyle}
          onClick={handleCanvasClick}
        />
      </Box>

      {/* 시작 버튼 */}
      <Button
        colorScheme="orange"
        onClick={handleSpin}
        isLoading={isSpinning}
        mt={6}
      >
        시작하기
      </Button>

      {/* 편집 모달 */}
      <Modal isOpen={editingIndex !== null} onClose={() => setEditingIndex(null)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>영역 이름 편집</ModalHeader>
          <ModalBody>
            <Input
              value={tempText}
              onChange={(e) => setTempText(e.target.value)}
              placeholder="새 이름 입력"
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleEditText}>
              저장
            </Button>
            <Button colorScheme="red" ml={3} onClick={() => setEditingIndex(null)}>
              취소
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Roulette;
