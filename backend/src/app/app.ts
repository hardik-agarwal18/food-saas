import express from 'express';

import healthRouter from './health.routes.js';
import { container } from 'tsyringe';
import { HttpLogger } from '../infrastructure/observability/logger/http.logger.js';
import { RequestContextMiddleware } from '../infrastructure/observability/request-context/request-context.middleware.js';
import { ErrorHandlerMiddleware } from './middleware/error-handler.middleware.js';
import { registerSecurity } from '../infrastructure/security/security.js';

export const app = express();

registerSecurity(app);

const requestContextMiddleware = container.resolve(RequestContextMiddleware);
app.use(requestContextMiddleware.handle);

const httpLogger = container.resolve(HttpLogger);
app.use(httpLogger.middleware);

app.use(healthRouter);

const errorHandler = container.resolve(ErrorHandlerMiddleware);
app.use(errorHandler.handle);
