import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export const validateApiKey = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const apiKey = req.headers['x-api-key'] as string | undefined;
  const validApiKey = process.env.API_KEY;

  if (!validApiKey) {
    next(new AppError(500, 'API_KEY not configured', 'CONFIG_ERROR'));
    return;
  }

  if (!apiKey) {
    next(new AppError(401, 'API key is required', 'MISSING_API_KEY'));
    return;
  }

  // 尝试解码 Base64 编码的 API Key
  let decodedApiKey = apiKey;
  try {
    decodedApiKey = Buffer.from(apiKey, 'base64').toString('utf-8');
  } catch (err) {
    console.log('[API Key Validation] Base64 decode failed, using original');
  }


  if (decodedApiKey !== validApiKey) {
    next(new AppError(403, 'Invalid API key', 'INVALID_API_KEY'));
    return;
  }

  next();
};