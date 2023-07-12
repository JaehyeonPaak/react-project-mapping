const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = express();
const pinRoute = require('./routes/pins');

// .env 파일을 불러옴
dotenv.config();

// app.use() 함수는 Express 앱에서 항상 실행하는 미들웨어의 역할, URL에 상관없이 앱이 요청을 수신할 때마다 매번 실행
// It parses incoming JSON requests and puts the parsed data in req.body
app.use(express.json());

// Mongo DB 연결
mongoose.connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log('Mongo DB connected!');
    })
    .catch((error) => {
        console.log(error);
    });

app.use('/api/pins/', pinRoute);

// 포트 번호 1035로 연결
app.listen(1035, () => {
    console.log('Backend server is running!');
    });