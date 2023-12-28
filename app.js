const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const publicRouter = require('./routes/public');
const chatcompletionRouter = require('./routes/chatcompletion');
const prettierRouter = require('./routes/prettier');

const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const hpp = require('hpp');
const helmet = require('helmet');

const app = express();

if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
  app.use(hpp());
  app.use(helmet({ crossOriginResourcePolicy: false }));
} else {
  app.use(morgan('dev'));
}

app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', express.static(path.join(__dirname, 'uploads')));
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use('/public', publicRouter);
app.use('/chatcompletion', chatcompletionRouter);
app.use('/prettier', prettierRouter);

const { swaggerUi, specs } = require('./swagger');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

app.listen(process.env.PORT || 4060, () => {
  console.log(`${process.env.PORT} 서버 실행 중`);
});
