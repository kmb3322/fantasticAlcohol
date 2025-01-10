// server/routes/moleRoutes.js
const express = require('express');
const router = express.Router();

// (예시) 두더지 게임 랭킹 불러오기 (DB X, 샘플)
router.get('/ranking', (req, res) => {
  res.json([
    { nickname: 'Alice', score: 10 },
    { nickname: 'Bob', score: 8 },
    { nickname: 'Carol', score: 6 },
  ]);
});

module.exports = router;
