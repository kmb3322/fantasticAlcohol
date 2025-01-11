// src/App.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import SojuGame from './components/SojuGame';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/soju" element={<SojuGame />} />
    </Routes>
  );
}

export default App;
