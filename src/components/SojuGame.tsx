// src/components/Capture.tsx (추가 및 수정된 부분)
import React, { useRef, useState } from "react";
import { Box, Button, Text, VStack, background, useToast } from "@chakra-ui/react";
import Webcam from "react-webcam";
import { useNavigate } from "react-router-dom";
import ResultModal from "./ResultModal";
import { transform } from "framer-motion";

function SojuGame() {
  const navigate = useNavigate();
  const toast = useToast();
  const webcamRef = useRef<Webcam>(null);

  // 목표 용량 일단 35mL로 고정 -> 실제로는 랜덤(MAX 50mL)
  const targetVolume = 35;

  // 결과 모달 관련 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resultType, setResultType] = useState<"less" | "more" | 'exact' | null>(null);
  const [resultMessage, setResultMessage] = useState<string>("");
  const [capturedImage, setCapturedImage] = useState<string>(""); // 팝업에 띄울 사진

  // 사진찍기 & 분석
  const handleCapture = () => {
    if (!webcamRef.current) return;

    const screenshot = webcamRef.current.getScreenshot();
    if (!screenshot) {
      toast({ title: "캡처 실패! 다시 시도하세요.", status: "error" });
      return;
    }

    // 캡처 이미지 저장
    setCapturedImage(screenshot);

    // 실제 소주 용향을 임의로 계산
    const randomVolume = Math.floor(Math.random() * 50) + 1;
    // 분석 결과
    if (randomVolume > targetVolume + 5) {
      setResultType("more");
      setResultMessage(`${randomVolume}mL로 너무 많이 부었어요!`);
    } else if (randomVolume < targetVolume - 5) {
      setResultType("less");
      setResultMessage(`${randomVolume}mL로 너무 적게 부었어요!`);
    } else {
      setResultType("exact");
      setResultMessage(`${randomVolume}mL로 딱 맞게 부었어요!`);
    }
    setIsModalOpen(true);
  };

  const handleRetry = () => {
    setIsModalOpen(false);
    setCapturedImage("");
  };

  const handleEnd = () => {
    navigate("/");
  };

  return (
    <VStack spacing={6} p={4}>
      <Text fontSize="2xl" fontWeight="bold">
        소주잔 용량 맞추기
      </Text>
      <Text fontSize="lg" color="teal.500">
        목표 용량: {targetVolume}ml
      </Text>

      {/* 카메라 영역 + 점선 소주잔 모양 가이드 */}
      <Box position="relative" w="300px" h="400px" bg="gray.200">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          width={300}
          height={400}
          videoConstraints={{ facingMode: 'environment' }}
          style={{ objectFit: 'cover' }}
        />

        {/* 점선 소주잔 모양 (간단한 박스 예시) */}
        <Box
          position="absolute"
          top="50px"
          left="50px"
          w="200px"
          h="300px"
          // border="3px dashed white"
          pointerEvents="none"
          sx={{
            clipPath: 'polygon(0% 0%, 100% 0%, 20% 100%, 80% 100%)',
            borderTop: '3px dashed white',
            borderBottom: '3px dashed white',
            // position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '0',
              left: '0',
              width: '3px',
              height: '100%',
              background: 'linear-gradient(to bottom, white 50%, transparent 50%)',
              backgroundSize: '10px 10px',
              transform: 'rotate(-10deg)',
              clipPath: 'polygon(0% 0%, 20% 100%, 0% 100%)',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: '0',
              right: '0%',
              width: '3px',
              height: '100%',
              background: 'linear-gradient(to bottom, white 50%, transparent 50%)',
              backgroundSize: '10px 10px',
              transform: 'rotate(10deg)',
              clipPath: 'polygon(100% 0%, 80% 100%, 100% 100%)'
            }
          }}
        >
          {/* 여기에 추가 CSS/SVG로 잔 모양 구현 가능 */}
        </Box>
      </Box>

      <Button colorScheme="teal" onClick={handleCapture}>
        사진 찍기
      </Button>

      {/* 결과 팝업 */}
      <ResultModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        resultType={resultType}
        resultMessage={resultMessage}
        finalImage={capturedImage}
        onRetry={handleRetry}
        onEnd={handleEnd}
      />
    </VStack>
  );
}


export default SojuGame;