
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import VideoIntro from './components/VideoIntro';
import GamePage from './pages/GamePage';
import HomePage from './pages/HomePage';
import LobbyPage from './pages/LobbyPage';
import SojuGame from './components/SojuGame';
import RandomGameLobby from './components/RandomGameLobby';
import Winner from './components/Winner';
import { RouletteProvider } from './context/RouletteContext';
import Ladder from './components/Ladder';

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
          <Route path="/random" element={<RandomGameLobby />} />
          <Route path="/random/roulette" element={<Winner />} />
          <Route path="/random/ladder" element={<Ladder />} />
          {/* 기타 라우트 정의 가능 */}
        </Routes>
      </RouletteProvider>
    </Router>
  );
}

export default App;
