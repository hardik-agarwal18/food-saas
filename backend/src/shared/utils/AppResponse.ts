import { Response } from 'express';
import { ApiResponse } from '../types/ApiResponse.js';

export const sendResponse = <T>(res: Response, statusCode: number, payload?: ApiResponse<T>) => {
  return res.status(statusCode).json(payload);
};
