import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { corsOptions } from '../config/cors.js';
import { requestLogger } from './middleware/request-logger.middleware.js';
import healthRouter from './health.routes.js';

export const app = express();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use(cookieParser());
app.use(cors(corsOptions));

app.use('/api', healthRouter);
