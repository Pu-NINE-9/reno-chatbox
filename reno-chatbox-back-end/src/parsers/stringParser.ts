import { z } from 'zod';
import { logger } from '../utils/logger';

export const ParserSchema = z.object({
  type: z.enum(['json', 'xml', 'csv', 'markdown', 'plain']),
  data: z.string(),
  options: z.object({
    strict: z.boolean().optional().default(true),
    fields: z.array(z.string()).optional(),
  }).optional(),
});

export type ParserInput = z.infer<typeof ParserSchema>;

interface ParsedResult {
  success: boolean;
  data?: unknown;
  error?: string;
  format?: string;
}

class StringParserService {
  parseJson(input: string, strict = true): ParsedResult {
    try {
      const data = JSON.parse(input);
      return { success: true, data, format: 'json' };
    } catch (error) {
      logger.warn({ error, input: input.substring(0, 100) }, 'JSON parse error');
      if (strict) {
        return { success: false, error: `Invalid JSON: ${(error as Error).message}`, format: 'json' };
      }
      return { success: false, error: (error as Error).message, format: 'json' };
    }
  }

  parseXml(input: string, strict = true): ParsedResult {
    const xmlRegex = /<([a-zA-Z_][\w.-]*)[^>]*>(.*?)<\/\1>/gs;
    const selfClosingRegex = /<([a-zA-Z_][\w.-]*)[^>]*\/>/g;

    try {
      const result: Record<string, unknown> = {};
      let match;

      const selfClosingMatches = input.match(selfClosingRegex) || [];
      selfClosingMatches.forEach(tag => {
        const tagMatch = tag.match(/<([a-zA-Z_][\w.-]*)[^>]*\/>/);
        if (tagMatch) {
          const attrMatch = tag.match(/(\w+)="([^"]*)"/);
          result[tagMatch[1]] = attrMatch ? attrMatch[2] : '';
        }
      });

      while ((match = xmlRegex.exec(input)) !== null) {
        const [, tagName, content] = match;
        const attrMatch = match[0].match(/(\w+)="([^"]*)"/);
        result[tagName] = content.trim();
        if (attrMatch) {
          result[`${tagName}_attrs`] = { [attrMatch[1]]: attrMatch[2] };
        }
      }

      if (Object.keys(result).length === 0 && strict) {
        return { success: false, error: 'No valid XML elements found', format: 'xml' };
      }

      return { success: true, data: result, format: 'xml' };
    } catch (error) {
      logger.warn({ error }, 'XML parse error');
      return { success: false, error: (error as Error).message, format: 'xml' };
    }
  }

  parseCsv(input: string, fields?: string[]): ParsedResult {
    try {
      const lines = input.trim().split('\n');
      if (lines.length < 2) {
        return { success: false, error: 'CSV must have at least a header and one data row', format: 'csv' };
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const data = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const row: Record<string, string> = {};
        headers.forEach((header, idx) => {
          if (!fields || fields.includes(header)) {
            row[header] = values[idx] || '';
          }
        });
        data.push(row);
      }

      return { success: true, data, format: 'csv' };
    } catch (error) {
      logger.warn({ error }, 'CSV parse error');
      return { success: false, error: (error as Error).message, format: 'csv' };
    }
  }

  parseMarkdown(input: string): ParsedResult {
    try {
      const result: {
        title?: string;
        headings: Array<{ level: number; text: string }>;
        codeBlocks: Array<{ language: string; code: string }>;
        lists: string[];
        paragraphs: string[];
      } = {
        headings: [],
        codeBlocks: [],
        lists: [],
        paragraphs: [],
      };

      const lines = input.split('\n');
      let inCodeBlock = false;
      let currentCodeBlock: { language: string; code: string } | null = null;

      for (const line of lines) {
        if (line.startsWith('```')) {
          if (inCodeBlock && currentCodeBlock) {
            result.codeBlocks.push(currentCodeBlock);
            currentCodeBlock = null;
          } else {
            inCodeBlock = true;
            currentCodeBlock = { language: line.slice(3).trim(), code: '' };
          }
          continue;
        }

        if (inCodeBlock && currentCodeBlock) {
          currentCodeBlock.code += line + '\n';
          continue;
        }

        const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
        if (headingMatch) {
          result.headings.push({
            level: headingMatch[1].length,
            text: headingMatch[2],
          });
          if (headingMatch[1].length === 1 && !result.title) {
            result.title = headingMatch[2];
          }
          continue;
        }

        if (line.startsWith('- ') || line.startsWith('* ')) {
          result.lists.push(line.slice(2));
          continue;
        }

        if (line.trim()) {
          result.paragraphs.push(line.trim());
        }
      }

      return { success: true, data: result, format: 'markdown' };
    } catch (error) {
      logger.warn({ error }, 'Markdown parse error');
      return { success: false, error: (error as Error).message, format: 'markdown' };
    }
  }

  parsePlain(input: string): ParsedResult {
    return {
      success: true,
      data: {
        text: input,
        length: input.length,
        wordCount: input.split(/\s+/).filter(Boolean).length,
        lineCount: input.split('\n').length,
      },
      format: 'plain',
    };
  }

  parse(request: ParserInput): ParsedResult {
    const { type, data, options = { strict: true, fields: undefined } } = request;
    const { strict, fields } = options;

    switch (type) {
      case 'json':
        return this.parseJson(data, strict);
      case 'xml':
        return this.parseXml(data, strict);
      case 'csv':
        return this.parseCsv(data, fields);
      case 'markdown':
        return this.parseMarkdown(data);
      case 'plain':
        return this.parsePlain(data);
      default:
        return { success: false, error: `Unknown format: ${type}`, format: type };
    }
  }
}

export const stringParser = new StringParserService();
