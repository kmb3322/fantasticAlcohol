// server/app.js
const express = require('express');
const cors = require('cors');

const homeRoutes = require('./routes/homeRoutes');
const moleRoutes = require('./routes/moleRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// 홈
app.use('/', homeRoutes);

// 두더지 게임 REST API
app.use('/mole', moleRoutes);

module.exports = app;
