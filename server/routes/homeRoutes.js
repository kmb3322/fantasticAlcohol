// server/routes/homeRoutes.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Welcome to My Game Platform - Home');
});

module.exports = router;
