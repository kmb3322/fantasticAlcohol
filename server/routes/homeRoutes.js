// server/routes/homeRoutes.js
const express = require('express');
const router = express.Router();

// 예: 클라이언트가 "메인 화면"에서 필요한 정보를 가져올 수 있는 API
// 사실상 SPA(React)라면 이 부분은 크게 필요없고, 
// 백엔드에서 인증 등을 처리한다면 로그인 라우트를 구현할 수 있음.
router.get('/', (req, res) => {
  res.send('Welcome to My Game Platform - Home');
});

module.exports = router;
