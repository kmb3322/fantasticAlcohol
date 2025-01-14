// client/src/socket.ts
import { io } from 'socket.io-client';

// 서버 주소 맞게 설정
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://thisis.sojubackend.monster';
export const socket = io(BACKEND_URL, {
    withCredentials: true,
    extraHeaders: {
      'Access-Control-Allow-Origin': 'https://soju.monster, https://www.soju.monster'
  }
  });