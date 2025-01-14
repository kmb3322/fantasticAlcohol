require('dotenv').config();

const express = require("express");
const multer = require("multer");
const axios = require("axios");
const cors = require("cors");
const vision = require('@google-cloud/vision');
const http = require('http');
const { Server } = require('socket.io');

// controllers
const { handleMoleGameConnection, rooms } = require('./controllers/moleGameController');

const app = express();

// CORS 설정
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://soju.monster';
const additionalOrigins = [
  'https://soju.monster',
  'http://localhost:5173', 
  'https://51ef-2001-2d8-6a87-cd2e-8450-a2e1-9d1a-764e.ngrok-free.app',
  'https://fantastic-alcohol.vercel.app', 
  'https://www.soju.monster'
];
const corsOptions = {
  origin: function(origin, callback) {
    // 요청 출처가 허용 목록에 있거나, 요청 출처가 undefined (예: 서버 간 호출)인 경우 허용
    if (!origin || additionalOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS 정책에 의해 차단됨'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true, // 자격 증명 허용
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));


app.use(express.json());

// Health 체크 엔드포인트 추가
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Google Cloud Vision 클라이언트 초기화
const client = new vision.ImageAnnotatorClient({
  keyFilename: './omega-healer-447609-m2-172f1d71426c.json'
});

// API 키 로깅(존재 여부만)
console.log('API Key 존재 여부:', !!process.env.OPENAI_API_KEY);

// ----------- /analyze 라우트 - Vision API & OpenAI 호출 -----------
app.post('/analyze', (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      if (err instanceof multer.MulterError) {
        // Multer 에러 처리
        console.error('Multer 에러:', err);
        return res.status(400).json({
          error: '파일 업로드 에러',
          details: err.message
        });
      } else {
        // 알 수 없는 에러
        console.error('알 수 없는 에러:', err);
        return res.status(500).json({
          error: '서버 에러',
          details: err.message
        });
      }
    }

    // 파일 체크
    if (!req.file) {
      console.error('파일이 없음');
      return res.status(400).json({
        error: '이미지 파일이 없습니다.',
        details: 'No file uploaded'
      });
    }

    try {
      console.log('받은 파일 정보:', {
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      });

      console.log('Vision API 호출 시작');

      // Google Cloud Vision API 호출
      const [result] = await client.objectLocalization({
        image: {
          content: req.file.buffer
        }
      });

      console.log('Vision API 결과:', result);

      const objects = result.localizedObjectAnnotations;
      console.log('감지된 객체들:', objects.map(obj => obj.name));

      // 감지 조건(소주잔 유사 객체 탐색)
      const glassFound = objects.some(obj =>
        obj.name.toLowerCase().includes('glass') ||
        obj.name.toLowerCase().includes('cup') ||
        obj.name.toLowerCase().includes('drink') ||
        obj.name.toLowerCase().includes('tableware')
      );

      console.log('소주잔 감지 여부:', glassFound);

      if (!glassFound) {
        return res.status(400).json({
          error: '이미지에서 소주잔을 찾을 수 없습니다.',
          detected_objects: objects.map(obj => obj.name)
        });
      }

      // OpenAI API 호출
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "이 이미지의 소주잔에 담긴 소주의 양을 ml 단위로 숫자만 답변해주세요. 예시: 25"
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${req.file.buffer.toString('base64')}`
                }
              }
            ]
          }
        ],
        max_tokens: 300
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      });

      console.log('OpenAI 응답:', response.data.choices[0].message.content); // 디버깅용

      const content = response.data.choices[0].message.content;
      const matches = content.match(/\d+/);

      if (!matches) {
        throw new Error('응답에서 숫자를 찾을 수 없습니다. 응답 내용: ' + content);
      }

      const volume = parseInt(matches[0], 10);

      res.json({
        volume,
        glassDetected: true
      });

    } catch (error) {
      console.error('Vision API 에러:', error);
      res.status(500).json({
        error: '이미지 처리 실패',
        details: error.message
      });
    }
  });
});

// ----------- Socket.io 및 서버 생성 -----------
// Socket 서버
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: function(origin, callback) {
      if (!origin || additionalOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});
// 소켓 연결
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // 두더지 게임 소켓 로직
  handleMoleGameConnection(socket, io);
});

// 3분 이상 활동 없는 유저 자동 제거
const CLEANUP_INTERVAL = 30 * 1000; // 30초 간격
const INACTIVE_THRESHOLD = 3 * 60 * 1000; // 3분

setInterval(() => {
  const now = Date.now();
  Object.keys(rooms).forEach((roomCode) => {
    const room = rooms[roomCode];
    Object.keys(room.players).forEach((userId) => {
      const player = room.players[userId];
      if (now - player.lastActivityAt > INACTIVE_THRESHOLD) {
        delete room.players[userId];
      }
    });
    if (Object.keys(room.players).length === 0) {
      delete rooms[roomCode];
    }
  });
}, CLEANUP_INTERVAL);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});