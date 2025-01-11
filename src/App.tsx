
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import VideoIntro from './components/VideoIntro';
import GamePage from './pages/GamePage';
import HomePage from './pages/HomePage';
import LobbyPage from './pages/LobbyPage';
import SojuGame from './components/SojuGame';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/intro" element={<VideoIntro />} />
        <Route path="/soju" element={<SojuGame />} />
        <Route path="/lobby" element={<LobbyPage />} />
        <Route path="/game" element={<GamePage />} />
        {/* 기타 라우트 정의 가능 */}
      </Routes>
    </Router>
  );
}

export default App;
