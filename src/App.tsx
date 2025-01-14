
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import RouletteGameLobby from './components/RouletteGameLobby';
import SojuGame from './components/SojuGame';
import VideoIntro from './components/VideoIntro';
import Winner from './components/Winner';
import { RouletteProvider } from './context/RouletteContext';
import GamePage from './pages/GamePage';
import HomePage from './pages/HomePage';
import LobbyPage from './pages/LobbyPage';

function App() {
  return (
    <Router>
      <RouletteProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/intro" element={<VideoIntro />} />
          <Route path="/soju" element={<SojuGame />} />
          <Route path="/lobby" element={<LobbyPage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/random" element={<RouletteGameLobby />} />
          <Route path="/random/roulette" element={<Winner />} />
          {/* 기타 라우트 정의 가능 */}
        </Routes>
      </RouletteProvider>
    </Router>
  );
}

export default App;
