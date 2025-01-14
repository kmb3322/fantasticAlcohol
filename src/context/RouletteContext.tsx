import React, { createContext, useState, useContext, ReactNode } from "react";

type RouletteType = '당첨 룰렛' | '비율 룰렛';

interface RouletteContextProps {
  rouletteType: RouletteType;
  setRouletteType: (type: RouletteType) => void;
  playerCount: number;
  setPlayerCount: (count: number) => void;
}

const RouletteContext = createContext<RouletteContextProps | null>(null);

export function RouletteProvider({ children }: { children: ReactNode }) {
  const [rouletteType, setRouletteType] = useState<RouletteType>('당첨 룰렛');
  const [playerCount, setPlayerCount] = useState(4);
  
  return (
    <RouletteContext.Provider value={{ rouletteType, setRouletteType, playerCount, setPlayerCount }}>
      {children}
    </RouletteContext.Provider>
  );
}

export function useRouletteContext() {
  const context = useContext(RouletteContext);
  if (!context) {
    throw new Error('useRouletteContext must be used within a RouletteProvider');
  }
  return context;
}

