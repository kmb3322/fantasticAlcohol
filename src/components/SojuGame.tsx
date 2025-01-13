// src/components/Capture.tsx (추가 및 수정된 부분)
import { Box, Button, Text, VStack, useToast } from "@chakra-ui/react";
import axios from "axios";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import ResultModal from "./ResultModal";

function SojuGame() {
  const navigate = useNavigate();
  const toast = useToast();
  const webcamRef = useRef<Webcam>(null);

  // 20mL에서 50mL 사이의 랜덤한 목표 용량 설정
  const [targetVolume] = useState(() => {
    return Math.floor(Math.random() * (50 - 20 + 1)) + 20;
  })

  // 결과 모달 관련 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resultType, setResultType] = useState<"less" | "more" | 'exact' | null>(null);
  const [resultMessage, setResultMessage] = useState<string>("");
  const [capturedImage, setCapturedImage] = useState<string>(""); // 팝업에 띄울 사진

  const GUIDE_X = 45; // 가이드라인의 x 위치
  const GUIDE_Y = 60; // 가이드라인의 y 위치
  const GUIDE_W = 150; // 가이드라인의 너비
  const GUIDE_H = 200; // 가이드라인의 높이

  // 사진찍기 & 분석
  const handleCapture = async () => {
    if (!webcamRef.current) return;

    try {
      const screenshot = webcamRef.current.getScreenshot();
      if (!screenshot) {
        toast({ title: "캡처 실패! 다시 시도하세요.", status: "error" });
        return;
      }

      const img = new Image();
      img.src = screenshot;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);

      const cropCanvas = document.createElement('canvas');
      cropCanvas.width = GUIDE_W;
      cropCanvas.height = GUIDE_H;
      const cropCtx = cropCanvas.getContext('2d');
      if (!cropCtx) return;

      cropCtx.drawImage(canvas, GUIDE_X, GUIDE_Y, GUIDE_W, GUIDE_H, 0, 0, GUIDE_W, GUIDE_H);

      const croppedBase64 = cropCanvas.toDataURL('image/jpeg');
      setCapturedImage(croppedBase64);

      // 디버깅을 위한 로그
      console.log('스크린샷 데이터 존재:', !!screenshot);

      // Base64 이미지를 Blob으로 변환
      const response = await fetch(screenshot);
      const blob = await response.blob();

      // 디버깅을 위한 로그
      console.log('Blob 생성됨:', blob.size, 'bytes');

      const formData = new FormData();
      formData.append('image', blob, 'capture.jpg');

      // FormData 내용 확인
      for (let pair of formData.entries()) {
        console.log('FormData 항목:', pair[0], pair[1]);
      }

      const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const analysisResponse = await axios.post(`${API_URL}/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
        // 디버깅을 위한 요청 설정 추가
        onUploadProgress: (progressEvent) => {
          console.log('업로드 진행률:', progressEvent.loaded);
        }
      });

      console.log('서버 응답:', analysisResponse.data);

      const { volume, glassDetected } = analysisResponse.data;

      // 소주잔이 감지되지 않은 경우
      if (!glassDetected) {
        toast({
          title: "소주잔을 찾을 수 없습니다",
          description: "가이드라인에 맞춰 소주잔을 위치시켜주세요",
          status: "warning",
          duration: 3000,
          isClosable: true
        });
        return;
      }

      // volume이 undefined인 경우 처리
      if (!volume) {
        throw new Error('서버로부터 volume 데이터를 받지 못했습니다.');
      }

      // 결과 판정
      if (volume > targetVolume + 2) {
        setResultType("more");
        setResultMessage(`목 말랐군요😉\n목표 용량보다 많이 따랐어요`);
      } else if (volume < targetVolume - 2) {
        setResultType("less");
        setResultMessage(`앗 아쉬워요😢\n목표 용량보다 적게 따랐어요`);
      } else {
        setResultType("exact");
        setResultMessage(`장인이시네요🤩\n딱 맞게 따랐어요!`);
      }

      setIsModalOpen(true);

    } catch (error) {
      const err = error as any; 
      // alert(`에러 타입: ${error.name}\n에러 메시지: ${error.message}\n전체 에러: ${JSON.stringify(error)}`);
      console.log('상세 에러:', error);
      // 더 자세한 에러 정보 표시
      const errorMessage = err.response?.data?.error || err.message;
      toast({
        title: "오류가 발생했습니다.",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true
      });
    }
  };

  const handleRetry = () => {
    setIsModalOpen(false);
    setCapturedImage("");
  };

  const handleEnd = () => {
    navigate("/");
  };

  return (
    <VStack spacing={6} p={4} align="center">
      {/* 타이틀 */}
      <Text fontWeight={700} fontSize="28px" opacity={0.8} mb="-2px">
        소주잔 용량 맞추기💚
      </Text>
      <Text fontSize="14px" color="#666" textAlign="center">
        목표 용량에 맞게 예측하여 각자 소주를<br />따른 후 가이드라인에 소주잔을 맞춰 사진을 찍어주세요!
      </Text>
      <Text fontSize="lg" color="#F19C7A" fontWeight={600}>
        목표 용량: {targetVolume}ml
      </Text>

      {/* 카메라 영역 + 점선 소주잔 모양 가이드 */}
      <Box position="relative" w="240px" h="320px" bg="gray.200">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          width={240}
          height={320}
          videoConstraints={{ facingMode: 'environment' }}
          style={{ objectFit: 'cover' }}
        />

        {/* 점선 소주잔 모양 (간단한 박스 예시) */}
        <Box
          position="absolute"
          top={`${GUIDE_Y}px`}
          left={`${GUIDE_X}px`}
          w={`${GUIDE_W}px`}
          h={`${GUIDE_H}px`}
          border="3px dashed white"
        >
          {/* 여기에 추가 CSS/SVG로 잔 모양 구현 가능 */}
        </Box>
      </Box>

      <Button bg="#F19C7A" color="white" _hover={{ bg: "#e58c63" }} _active={{ bg: "#d16f46" }} onClick={handleCapture}>
        사진 찍기
      </Button>

      {/* 결과 팝업 */}
      <ResultModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        resultType={resultType}
        resultMessage={resultMessage}
        finalImage={capturedImage}
        targetVolume={targetVolume}
        onRetry={handleRetry}
        onEnd={handleEnd}
      />
    </VStack>
  );
}


export default SojuGame;