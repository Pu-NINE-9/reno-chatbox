import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { ragService } from '../services/ragService';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export const ragRoutes = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      'text/plain',
      'text/markdown',
      'text/csv',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    const allowedExtensions = ['.txt', '.md', '.csv', '.pdf', '.docx'];

    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed: ${file.mimetype}`));
    }
  },
});

const sanitizeFileName = (fileName: string): string => {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 255);
};

ragRoutes.post('/upload', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new AppError(400, 'No file uploaded', 'NO_FILE');
    }

    const sanitizedFileName = sanitizeFileName(req.file.originalname);

    const result = await ragService.processFile(
      req.file.buffer,
      sanitizedFileName,
      req.file.mimetype || 'application/octet-stream'
    );

    res.json({
      success: true,
      data: {
        fileId: result.fileId,
        fileName: sanitizedFileName,
        chunkCount: result.chunkCount,
        fileSize: req.file.size,
      },
    });
  } catch (error) {
    next(error);
  }
});

ragRoutes.get('/files', (_req: Request, res: Response) => {
  const files = ragService.listFiles();
  res.json({
    success: true,
    data: files.map(f => ({
      id: f.id,
      fileName: f.fileName,
      fileType: f.fileType,
      chunkCount: f.chunkCount,
      fileSize: f.fileSize,
      uploadTime: f.uploadTime,
    })),
  });
});

ragRoutes.get('/files/:fileId', (req: Request, res: Response) => {
  const file = ragService.getFileInfo(req.params['fileId']);
  if (!file) {
    res.status(404).json({
      success: false,
      error: 'File not found',
    });
    return;
  }

  res.json({
    success: true,
    data: {
      id: file.id,
      fileName: file.fileName,
      fileType: file.fileType,
      chunkCount: file.chunkCount,
      fileSize: file.fileSize,
      uploadTime: file.uploadTime,
    },
  });
});

ragRoutes.delete('/files/:fileId', (req: Request, res: Response) => {
  const deleted = ragService.deleteFile(req.params['fileId']);
  if (!deleted) {
    res.status(404).json({
      success: false,
      error: 'File not found',
    });
    return;
  }

  res.json({
    success: true,
    message: 'File deleted successfully',
  });
});

ragRoutes.post('/retrieve', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query, topK = 5 } = req.body;

    if (!query || typeof query !== 'string') {
      throw new AppError(400, 'Query is required', 'MISSING_QUERY');
    }

    const results = await ragService.retrieve(query, Math.min(topK, 20));

    res.json({
      success: true,
      data: {
        query,
        results,
        count: results.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

ragRoutes.get('/stats', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: ragService.getStats(),
  });
});

ragRoutes.post('/save', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { filePath } = req.body;

    if (!filePath || typeof filePath !== 'string') {
      throw new AppError(400, 'File path is required', 'MISSING_PATH');
    }

    await ragService.saveIndex(filePath);

    res.json({
      success: true,
      message: 'Index saved successfully',
    });
  } catch (error) {
    next(error);
  }
});

ragRoutes.post('/load', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { filePath } = req.body;

    if (!filePath || typeof filePath !== 'string') {
      throw new AppError(400, 'File path is required', 'MISSING_PATH');
    }

    await ragService.loadIndex(filePath);

    res.json({
      success: true,
      message: 'Index loaded successfully',
    });
  } catch (error) {
    next(error);
  }
});
