// client/src/socket.ts
import { io } from 'socket.io-client';

// 서버 주소 맞게 설정
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://thisis.sojubackend.monster';
export const socket = io(backendUrl);