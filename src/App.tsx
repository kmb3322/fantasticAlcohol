// src/App.tsx
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import RouletteGameLobby from './components/RouletteGameLobby';
import SojuGame from './components/SojuGame';
import VideoIntro from './components/VideoIntro';
import Winner from './components/Winner';
import { RouletteProvider } from './context/RouletteContext';
import BalloonGamePage from './pages/BalloonGamePage';
import BalloonLobbyPage from './pages/BalloonLobbyPage';
import GamePage from './pages/GamePage';
import HomePage from './pages/HomePage';
import LobbyPage from './pages/LobbyPage';
import Russian from './components/Russian';
import DrinkGameLobby from './components/DrinkGameLobby';
import BeerGame from './components/BeerGame';

function App() {
  return (
    <Router>
      <RouletteProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/intro" element={<VideoIntro />} />
          <Route path="/drink" element={<DrinkGameLobby />} />
          <Route path="/drink/soju" element={<SojuGame />} />
          <Route path="/drink/beer" element={<BeerGame />} />
          <Route path="/lobby" element={<LobbyPage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/roulette" element={<RouletteGameLobby />} />
          <Route path="/roulette/winner" element={<Winner />} />
          <Route path="/roulette/russian" element={<Russian />} />
          {/* 풍선불기 게임 관련 라우트 추가 */}
          <Route path="/balloon/lobby" element={<BalloonLobbyPage />} />
          <Route path="/balloon/game" element={<BalloonGamePage />} />
          {/* 기타 라우트 정의 가능 */}
        </Routes>
      </RouletteProvider>
    </Router>
  );
}

export default App;
