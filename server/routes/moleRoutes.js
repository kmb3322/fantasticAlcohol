// server/routes/moleRoutes.js
const express = require('express');
const router = express.Router();

// 두더지 게임에서 사용할 수 있는 예시 REST API (DB 저장용 등)
// 현재는 간단한 예시, 실제로는 DB에 점수 저장/불러오기 등을 할 수 있음

router.get('/ranking', (req, res) => {
  // 예시: DB에서 두더지 게임 랭킹 불러오기
  // 현재는 샘플 데이터 리턴
  res.json([
    { nickname: 'Alice', score: 10 },
    { nickname: 'Bob', score: 8 },
    { nickname: 'Carol', score: 6 },
  ]);
});

module.exports = router;
