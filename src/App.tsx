
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import VideoIntro from './components/VideoIntro';
import GamePage from './pages/GamePage';
import HomePage from './pages/HomePage';
import LobbyPage from './pages/LobbyPage';
import SojuGame from './components/SojuGame';
import RouletteGameLobby from './components/RouletteGameLobby';
import Winner from './components/Winner';
import Ratio from './components/Ratio';
import { RouletteProvider } from './context/RouletteContext';

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
          <Route path="/roulette" element={<RouletteGameLobby />} />
          <Route path="/roulette/winner" element={<Winner />} />
          <Route path="/roulette/ratio" element={<Ratio />} />
          {/* 기타 라우트 정의 가능 */}
        </Routes>
      </RouletteProvider>
    </Router>
  );
}

export default App;
