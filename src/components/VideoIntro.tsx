// src/components/VideoIntro.tsx
import { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function VideoIntro() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // 목적지 정보 추출 (state로 전달)
  const destination = (location.state as { destination?: string })?.destination || '/';

  // 영상 재생 완료 시 호출
  const handleVideoEnd = () => {
    navigate(destination);
  };

  // 스킵 버튼 클릭 시 호출
  const handleSkip = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    navigate(destination);
  };

  return (
    <div 
      style={{
        position: 'relative', 
        width: '100%', 
        height: '100vh', 
        overflow: 'hidden', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: 'black'  // 배경색 지정 (필요 시)
      }}
    >
      <video
        ref={videoRef}
        src="/catstory.mp4"
        playsInline
        webkit-playsinline
        autoPlay
        onEnded={handleVideoEnd}
        style={{
          height: '80%',        // 화면 높이의 80%로 줄임
          objectFit: 'cover',
        }}
      />
      <button
        onClick={handleSkip}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          position: 'absolute',
          top: '20px',          // 상단에서 조금 아래로 조정
          right: '20px',        // 오른쪽 모서리에 위치
          padding: '10px 20px',
          fontSize: '20px',
          cursor: 'pointer',
          zIndex: 10
        }}
      >
        Skip
      </button>
    </div>
  );
}

export default VideoIntro;
