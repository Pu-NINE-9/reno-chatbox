import { Request, Response, NextFunction } from 'express';
import { cacheService, createHashKey } from '../services/cacheService';

export interface CacheOptions {
  ttl?: number;
  keyGenerator?: (req: Request) => string;
}

export const cacheMiddleware = (options: CacheOptions = {}) => {
  const { ttl, keyGenerator } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.method !== 'GET') {
      next();
      return;
    }

    const cacheKey = keyGenerator
      ? keyGenerator(req)
      : createHashKey(req.path, req.query);

    const cached = cacheService.get<unknown>(cacheKey);

    if (cached) {
      res.json({
        success: true,
        data: cached,
        cached: true,
      });
      return;
    }

    const originalJson = res.json.bind(res);
    res.json = (body: unknown) => {
      if (body && typeof body === 'object' && 'success' in body && (body as { success: boolean }).success) {
        cacheService.set(cacheKey, body, ttl);
      }
      return originalJson(body);
    };

    next();
  };
};
