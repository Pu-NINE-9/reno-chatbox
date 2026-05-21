import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Document } from 'langchain/document';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';

const EMBEDDING_MODEL = 'text-embedding-3-small';
const DEEPSEEK_EMBEDDING_URL = 'https://api.deepseek.com/beta/embeddings';

interface DocumentChunk {
  id: string;
  content: string;
  metadata: {
    source: string;
    chunkIndex: number;
    fileName: string;
    fileType: string;
  };
}

interface UploadedFile {
  id: string;
  fileName: string;
  fileType: string;
  uploadTime: Date;
  chunkCount: number;
  fileSize: number;
}

class RAGService {
  private vectorStore: MemoryVectorStore | null = null;
  private documents: DocumentChunk[] = [];
  private fileIndex: Map<string, UploadedFile> = new Map();
  private embeddings: OpenAIEmbeddings | null = null;

  constructor() {
    const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
    if (deepseekApiKey) {
      this.embeddings = new OpenAIEmbeddings({
        apiKey: deepseekApiKey,
        model: EMBEDDING_MODEL,
        configuration: {
          baseURL: DEEPSEEK_EMBEDDING_URL,
        },
      });
      logger.info('RAG using DeepSeek embeddings');
    } else {
      logger.warn('DEEPSEEK_API_KEY not found, RAG will use simple text matching');
    }
  }

  async processFile(
    buffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<{ fileId: string; chunkCount: number }> {
    const fileId = uuidv4();
    const fileExtension = path.extname(fileName).toLowerCase();
    const fileSize = buffer.length;

    logger.info({ fileId, fileName, mimeType, fileSize }, 'Processing file');

    let text = '';

    try {
      switch (mimeType) {
        case 'text/plain':
        case 'text/markdown':
        case 'text/csv':
          text = buffer.toString('utf-8');
          break;
        case 'application/pdf':
          text = await this.extractPdfText(buffer);
          break;
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          text = await this.extractDocxText(buffer);
          break;
        default:
          if (fileExtension === '.txt' || fileExtension === '.md' || fileExtension === '.csv') {
            text = buffer.toString('utf-8');
          } else {
            throw new Error(`Unsupported file type: ${mimeType}`);
          }
      }
    } catch (error) {
      logger.error({ error, fileName }, 'File processing error');
      throw error;
    }

    const chunks = await this.splitText(text, fileName, mimeType);

    if (this.embeddings) {
      const docs = chunks.map(
        chunk =>
          new Document({
            pageContent: chunk.content,
            metadata: chunk.metadata,
          })
      );

      if (!this.vectorStore) {
        this.vectorStore = await MemoryVectorStore.fromDocuments(docs, this.embeddings);
      } else {
        await this.vectorStore.addDocuments(docs);
      }
    }

    this.documents.push(...chunks);

    const uploadedFile: UploadedFile = {
      id: fileId,
      fileName,
      fileType: mimeType,
      uploadTime: new Date(),
      chunkCount: chunks.length,
      fileSize,
    };

    this.fileIndex.set(fileId, uploadedFile);

    logger.info({ fileId, chunkCount: chunks.length }, 'File processed successfully');

    return { fileId, chunkCount: chunks.length };
  }

  private async splitText(
    text: string,
    fileName: string,
    mimeType: string
  ): Promise<DocumentChunk[]> {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ['\n\n', '\n', '. ', ' ', ''],
    });

    const splits = await splitter.splitText(text);

    return splits.map((content, index) => ({
      id: uuidv4(),
      content,
      metadata: {
        source: 'file',
        chunkIndex: index,
        fileName,
        fileType: mimeType,
      },
    }));
  }

  private async extractPdfText(buffer: Buffer): Promise<string> {
    try {
      const pdfParse = await import('pdf-parse');
      const data = await pdfParse.default(buffer);
      return data.text;
    } catch (error) {
      logger.error({ error }, 'PDF extraction error');
      throw new Error('Failed to extract text from PDF');
    }
  }

  private async extractDocxText(buffer: Buffer): Promise<string> {
    try {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      logger.error({ error }, 'DOCX extraction error');
      throw new Error('Failed to extract text from DOCX');
    }
  }

  async retrieve(query: string, topK = 5): Promise<string[]> {
    if (!this.vectorStore || !this.embeddings) {
      return this.simpleTextSearch(query, topK);
    }

    try {
      const results = await this.vectorStore.similaritySearch(query, topK);
      return results.map(doc => doc.pageContent);
    } catch (error) {
      logger.error({ error, query }, 'Retrieval error');
      return this.simpleTextSearch(query, topK);
    }
  }

  private simpleTextSearch(query: string, topK: number): string[] {
    const queryWords = query.toLowerCase().split(/\s+/);
    const scored = this.documents.map(doc => {
      const content = doc.content.toLowerCase();
      let score = 0;
      for (const word of queryWords) {
        if (content.includes(word)) {
          score += 1;
          if (content.startsWith(word)) {
            score += 2;
          }
        }
      }
      return { content: doc.content, score };
    });

    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, topK).map(s => s.content);
  }

  async deleteFile(fileId: string): Promise<boolean> {
    const file = this.fileIndex.get(fileId);
    if (!file) {
      return false;
    }

    this.documents = this.documents.filter(
      doc => doc.metadata.source !== fileId
    );

    this.fileIndex.delete(fileId);

    logger.info({ fileId }, 'File deleted from RAG system');

    return true;
  }

  getFileInfo(fileId: string): UploadedFile | undefined {
    return this.fileIndex.get(fileId);
  }

  listFiles(): UploadedFile[] {
    return Array.from(this.fileIndex.values());
  }

  async saveIndex(filePath: string): Promise<void> {
    const data = {
      documents: this.documents,
      fileIndex: Array.from(this.fileIndex.entries()),
    };
    await fs.writeFile(filePath, JSON.stringify(data), 'utf-8');
    logger.info({ filePath, docCount: this.documents.length }, 'RAG index saved');
  }

  async loadIndex(filePath: string): Promise<void> {
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(data);
      this.documents = parsed.documents;
      this.fileIndex = new Map(parsed.fileIndex);
      logger.info({ filePath, docCount: this.documents.length }, 'RAG index loaded');
    } catch (error) {
      logger.warn({ error, filePath }, 'Failed to load RAG index');
    }
  }

  getStats() {
    return {
      totalDocuments: this.documents.length,
      totalFiles: this.fileIndex.size,
      files: this.listFiles().map(f => ({
        id: f.id,
        fileName: f.fileName,
        fileType: f.fileType,
        chunkCount: f.chunkCount,
        fileSize: f.fileSize,
        uploadTime: f.uploadTime,
      })),
    };
  }
}

export const ragService = new RAGService();
