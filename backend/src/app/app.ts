import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { corsOptions } from '../config/cors.js';
import healthRouter from './health.routes.js';
import { container } from 'tsyringe';
import { HttpLogger } from '../infrastructure/observability/logger/http.logger.js';
import { RequestContextMiddleware } from '../infrastructure/observability/request-context/request-context.middleware.js';
import { ErrorHandlerMiddleware } from './middleware/error-handler.middleware.js';

export const app = express();

const requestContextMiddleware = container.resolve(RequestContextMiddleware);
app.use(requestContextMiddleware.handle);

app.use(helmet());

const httpLogger = container.resolve(HttpLogger);
app.use(httpLogger.middleware);

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api', healthRouter);

const errorHandler = container.resolve(ErrorHandlerMiddleware);
app.use(errorHandler.handle);
