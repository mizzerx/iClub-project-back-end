import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import logger from 'morgan';
import database from './services/database';
import userRouter from './routes/usersRouter';
import authRouter from './routes/authRouter';
import clubsRouter from './routes/clubsRouter';
import workRouter from './routes/workRouter';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(helmet());
app.use(logger('dev'));

// Connect to the database
database.createConnection();

// Routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/clubs', clubsRouter);
app.use('/api/v1/works', workRouter);

// Handle 404
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Handle errors
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: true,
    data: null,
  });
});

export default app;
