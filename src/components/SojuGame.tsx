// src/components/Capture.tsx
import { Box, Button, Image, Text, useBreakpointValue, useToast } from "@chakra-ui/react";
import axios from "axios";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import ResultModal from "./ResultModal";
import SojuGlass from "./SojuGlass"; // 새로 추가된 컴포넌트

function SojuGame() {
  const navigate = useNavigate();
  const toast = useToast();
  const webcamRef = useRef<Webcam>(null);

  // 20mL에서 50mL 사이의 랜덤한 목표 용량 설정
  const [targetVolume] = useState(() => {
    return Math.floor(Math.random() * (50 - 20 + 1)) + 20;
  });

  // 결과 모달 관련 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  //const [resultType, setResultType] = useState<"less" | "more" | 'exact' | null>(null);
  const [resultMessage, setResultMessage] = useState<string>("");
  const [capturedImage, setCapturedImage] = useState<string>(""); // 팝업에 띄울 사진
  const [predictedVolume, setPredictedVolume] = useState<number | null>(null); // 서버에서 받은 예측 용량

  // 반응형 가이드라인 비율 설정
  const GUIDE_X_PERCENT = useBreakpointValue({ base: 20, md: 18.75 }); // 모바일과 데스크탑에서 다르게 설정
  const GUIDE_Y_PERCENT = useBreakpointValue({ base: 20, md: 20 });
  const GUIDE_W_PERCENT = useBreakpointValue({ base: 60, md: 50 });
  const GUIDE_H_PERCENT = useBreakpointValue({ base: 60, md: 60 });

  // 사진찍기 & 분석
  const handleCapture = async () => {
    if (!webcamRef.current) return;

    try {
      const screenshot = webcamRef.current.getScreenshot();
      if (!screenshot) {
        toast({ title: "캡처 실패! 다시 시도하세요.", status: "error" });
        return;
      }

      const img = document.createElement('img');
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

      // 백분율을 기반으로 크롭 좌표 계산
      const cropX = (GUIDE_X_PERCENT! / 100) * img.width;
      const cropY = (GUIDE_Y_PERCENT! / 100) * img.height;
      const cropW = (GUIDE_W_PERCENT! / 100) * img.width;
      const cropH = (GUIDE_H_PERCENT! / 100) * img.height;

      const cropCanvas = document.createElement('canvas');
      cropCanvas.width = cropW;
      cropCanvas.height = cropH;
      const cropCtx = cropCanvas.getContext('2d');
      if (!cropCtx) return;

      cropCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

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
      if (volume === undefined || volume === null) {
        throw new Error('서버로부터 volume 데이터를 받지 못했습니다.');
      }

      // 서버로부터 받은 예측 용량 설정
      setPredictedVolume(volume);

      // 결과 판정
      if (volume > targetVolume + 2) {
        //setResultType("more");
        setResultMessage(`목 말랐군요😉\n목표 용량보다 많이 따랐어요\n맛있게 마시기😸`);
      } else if (volume < targetVolume - 2) {
        //setResultType("less");
        setResultMessage(`앗 아쉬워요😢\n목표 용량보다 적게 따랐어요\n꽉 채워서 마시기☠️`);
      } else {
        //setResultType("exact");
        setResultMessage(`장인이시네요🤩\n딱 맞게 따랐어요!\n맛있게 마시😋`);
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
    setPredictedVolume(null);
    //setResultType(null);
    setResultMessage("");
  };

  const handleEnd = () => {
    navigate("/");
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
        mb="20px"
      >
        <Image
          width="211px"
          height="94px"
          objectFit="contain"
          mb="2px"
          src="/soju.png"
          alt="soju logo"
        />
        <Text fontWeight={700} fontSize="28px" opacity={0.8} mb="-2px">
          소주잔 용량 맞추기
        </Text>
        <Text fontSize="14px" color="#666" textAlign="center">
          목표 용량에 맞게 예측하여 각자 술을 따른 후<br />가이드라인에 소주잔을 맞춰 사진을 찍어주세요!
        </Text>
      </Box>
      <Box
        display="flex"
        flexDirection="column"
        mb="30px"
      >
        <Text fontSize="lg" color="#F19C7A" fontWeight={600}>
          목표 용량: {targetVolume}ml
        </Text>
      </Box>

      {/* 카메라 영역 + 소주잔 SVG 가이드 */}
      <Box
        position="relative"
        width={["70vw", "200px"]} // 모바일에서는 화면 너비의 80%, 데스크탑에서는 240px
        aspectRatio="3 / 4" // 세로로 긴 비율 유지
        bg="gray.200"
        maxW="200px"
        w="100%"
        overflow="hidden" // 이미지가 넘치지 않도록 설정
        borderRadius="md"
        boxShadow="md"
        mb="30px"
      >
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            facingMode: 'environment',
            aspectRatio: 3 / 4,
            width: 480, // 해상도 조정
            height: 640,
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover', // 'cover'로 설정하여 가이드라인 영역을 충분히 채우도록 함
          }}
        />

        {/* 소주잔 SVG 가이드 */}
        <SojuGlass />
      </Box>

      <Button
        bg="#F19C7A"
        w="195px"
        // h="52px"
        borderRadius="20px"
        color="white"
        _hover={{ bg: "#e58c63" }}
        _active={{ bg: "#d16f46" }}
        onClick={handleCapture}
      >
        사진 찍기
      </Button>

      {/* 결과 팝업 */}
      <ResultModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        resultMessage={resultMessage}
        finalImage={capturedImage}
        predictedVolume={predictedVolume} // 새로 추가된 prop
        onRetry={handleRetry}
        onEnd={handleEnd}
      />
    </Box>
  );
}

export default SojuGame;
