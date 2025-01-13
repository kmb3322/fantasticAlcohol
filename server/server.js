const express = require("express");
const multer = require("multer");
const axios = require("axios");
const dotenv = require("dotenv");
const cors = require("cors");
const vision = require('@google-cloud/vision');

dotenv.config();

// API 키 확인을 위한 로그
console.log('API Key 존재 여부:', !!process.env.OPENAI_API_KEY);
// 실제 키 값은 보안을 위해 로그에 직접 출력하지 않습니다

const app = express();
const upload = multer({
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
}).single('image');

const corsOptions = {
    origin: ['http://localhost:5173', 'https://51ef-2001-2d8-6a87-cd2e-8450-a2e1-9d1a-764e.ngrok-free.app'], // Vite 기본 포트
    methods: ['GET', 'POST'],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Google Cloud Vision 클라이언트 초기화
const client = new vision.ImageAnnotatorClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS // Google Cloud 인증 파일 경로
});

app.post('/analyze', (req, res) => {
    upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            // Multer 에러 처리
            console.error('Multer 에러:', err);
            return res.status(400).json({
                error: '파일 업로드 에러',
                details: err.message
            });
        } else if (err) {
            // 알 수 없는 에러
            console.error('알 수 없는 에러:', err);
            return res.status(500).json({
                error: '서버 에러',
                details: err.message
            });
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

            // 감지 조건 수정
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

            // OpenAI API 호출 부분
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

            const volume = parseInt(matches[0]);

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



