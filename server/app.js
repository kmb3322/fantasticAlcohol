// server/app.js
const express = require('express');
const cors = require('cors');
const homeRoutes = require('./routes/homeRoutes');
const moleRoutes = require('./routes/moleRoutes');
// 추후 다른 게임 라우트 import 가능

const app = express();
app.use(cors());
app.use(express.json());

// 홈 / 로그인 등
app.use('/', homeRoutes);

// 두더지 게임 관련 REST API
app.use('/mole', moleRoutes);

// 추후 다른 미니게임 라우트
// app.use('/dice', diceRoutes);

module.exports = app;
