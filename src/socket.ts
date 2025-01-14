const socket = io(BACKEND_URL, {
  withCredentials: true,
  transports: ['polling', 'websocket'], // polling을 첫 번째로 시도
  extraHeaders: {
    'Access-Control-Allow-Origin': 'https://soju.monster, https://www.soju.monster'
  },
  upgrade: true, // 웹소켓으로 업그레이드 허용
});