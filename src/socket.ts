// client/src/socket.ts
import { io } from 'socket.io-client';

// 서버 주소 맞게 설정
export const socket = io('http://localhost:4000');
