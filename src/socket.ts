// client/src/socket.ts
import { io } from 'socket.io-client';

// 서버 주소 맞게 설정
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
export const socket = io(backendUrl);