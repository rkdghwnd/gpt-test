const express = require('express');
const path = require('path');
const dotenv = require('dotenv')
dotenv.config()
const publicRouter = require('./routes/public')

const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const hpp = require('hpp');
const helmet = require('helmet');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
  app.use(hpp());
  app.use(helmet({ crossOriginResourcePolicy: false }));
} else {
  app.use(morgan('dev'));
}

// db.sequelize
//   .sync()
//   .then(() => {
//     console.log('db 연결 성공!');
//   })
//   .catch(console.error);

app.use(
  cors({
    origin: process.env.FRONT_END_DOMAIN,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', express.static(path.join(__dirname, 'uploads')));
app.use(cookieParser(process.env.COOKIE_SECRET));

// app.use(
//   session({
//     // secret: process.env.COOKIE_SECRET,
//     resave: false,
//     saveUninitialized: false,
//     // proxy: process.env.NODE_ENV === "production", // The "X-Forwarded-Proto" header will be used.
//     // cookie: {
//     //   httpOnly: true,
//     //   secure: true,
//     //   domain: process.env.NODE_ENV === "production" && ".houseshop.shop",
//     // },
//   })
// );

// app.use(passport.initialize()); // passport 초기화
// app.use(passport.session()); // 세션등록, deserializeUser() 호출

app.use('/public', publicRouter);

app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

app.listen(process.env.PORT || 4060, () => {
  console.log(`${process.env.PORT} 서버 실행 중`);
});
