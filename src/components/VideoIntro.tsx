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
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <video
        ref={videoRef}
        src="/catstory.mp4"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        autoPlay
        onEnded={handleVideoEnd}
      />
      <button
        onClick={handleSkip}
        style={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
          position: 'absolute',
          top: '40px',
          left: '90%',
          transform: 'translateX(-50%)',
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
