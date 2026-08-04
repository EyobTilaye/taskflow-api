import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/environment';
import { errorHandler } from './shared/middleware/error.middleware';
import { notFoundHandler } from './shared/middleware/route-not-found.middleware';

const app = express();

app.set('trust proxy', true);
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan(config.logFormat));

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "TaskFlow API is running",
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

export { app };
