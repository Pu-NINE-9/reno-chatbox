import { Router, Request, Response } from 'express';
import { stringParser, ParserSchema } from '../parsers/stringParser';
import { AppError } from '../middleware/errorHandler';

export const parseRoutes = Router();

parseRoutes.post('/', (req: Request, res: Response) => {
  const validation = ParserSchema.safeParse(req.body);

  if (!validation.success) {
    throw new AppError(400, 'Invalid request body', 'VALIDATION_ERROR');
  }

  const result = stringParser.parse(validation.data);

  if (!result.success) {
    res.status(400).json({
      success: false,
      error: result.error,
      format: result.format,
    });
    return;
  }

  res.json({
    success: true,
    data: result.data,
    format: result.format,
  });
});

parseRoutes.post('/validate', (req: Request, res: Response) => {
  const { type, data } = req.body;

  if (!type || !data) {
    throw new AppError(400, 'Type and data are required', 'MISSING_PARAMS');
  }

  const result = stringParser.parse({
    type,
    data,
    options: { strict: false },
  });

  res.json({
    success: result.success,
    format: result.format,
    error: result.error,
  });
});

parseRoutes.post('/batch', (req: Request, res: Response) => {
  const { items } = req.body;

  if (!Array.isArray(items)) {
    throw new AppError(400, 'Items must be an array', 'INVALID_INPUT');
  }

  if (items.length > 100) {
    throw new AppError(400, 'Maximum 100 items per batch', 'BATCH_TOO_LARGE');
  }

  const results = items.map((item, index) => {
    try {
      const validation = ParserSchema.safeParse(item);
      if (!validation.success) {
        return {
          index,
          success: false,
          error: 'Validation failed',
        };
      }

      const result = stringParser.parse(validation.data);
      return {
        index,
        ...result,
      };
    } catch (error) {
      return {
        index,
        success: false,
        error: (error as Error).message,
      };
    }
  });

  const successCount = results.filter(r => r.success).length;

  res.json({
    success: true,
    data: {
      results,
      total: items.length,
      successCount,
      failureCount: items.length - successCount,
    },
  });
});
