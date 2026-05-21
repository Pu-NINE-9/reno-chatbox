import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

const dangerousPatterns = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<\/?(iframe|object|embed|form)/gi,
  /\\x[0-9A-Fa-f]{2}/g,
  /\\u[0-9A-Fa-f]{4}/g,
];

const sqlKeywords = [
  'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE',
  'ALTER', 'EXEC', 'EXECUTE', 'UNION', '--', ';', '/*', '*/',
];

export const sanitizeInput = (input: string): string => {
  let sanitized = input;

  for (const pattern of dangerousPatterns) {
    sanitized = sanitized.replace(pattern, '');
  }

  sanitized = sanitized
    .replace(/['"]/g, '"')
    .replace(/[<>]/g, '')
    .trim();

  return sanitized;
};

export const validateInput = (input: string, fieldName: string): boolean => {
  const upperInput = input.toUpperCase();

  for (const keyword of sqlKeywords) {
    if (upperInput.includes(keyword)) {
      logger.warn({ fieldName, keyword, input: input.substring(0, 50) }, 'SQL keyword detected');
      return false;
    }
  }

  return true;
};

export const inputSanitizer = (req: Request, _res: Response, next: NextFunction): void => {
  const sanitizeObject = (obj: Record<string, unknown>): void => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = sanitizeInput(obj[key] as string);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key] as Record<string, unknown>);
      }
    }
  };

  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body as Record<string, unknown>);
  }

  if (req.query && typeof req.query === 'object') {
    sanitizeObject(req.query as Record<string, unknown>);
  }

  if (req.params && typeof req.params === 'object') {
    sanitizeObject(req.params as Record<string, unknown>);
  }

  next();
};

export const requestSizeLimiter = (maxSize = '10mb') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    const limit = parseInt(maxSize, 10) * 1024 * 1024;

    if (contentLength > limit) {
      res.status(413).json({
        error: 'Request entity too large',
      });
      return;
    }

    next();
  };
};
