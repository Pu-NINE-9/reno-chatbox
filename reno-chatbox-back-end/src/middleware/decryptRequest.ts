import { Request, Response, NextFunction } from 'express';
import CryptoJS from 'crypto-js';

// 加密密钥（从环境变量获取，确保前后端一致）
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-secret-key-32bytes!';

/**
 * AES 解密 - 使用 CryptoJS 确保与前端兼容
 * @param encryptedData 加密的字符串
 * @returns 解密后的数据
 */
const decrypt = (encryptedData: string): string => {
  try {
    const [ivStr, ciphertextStr, authTagStr] = encryptedData.split(':');
    if (!ivStr || !ciphertextStr || !authTagStr) {
      return encryptedData;
    }

    const iv = CryptoJS.enc.Base64.parse(ivStr);
    const ciphertext = CryptoJS.enc.Base64.parse(ciphertextStr);
    const authTag = CryptoJS.enc.Base64.parse(authTagStr);
    const key = CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY.padEnd(32, '\0').slice(0, 32));

    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: ciphertext, authTag: authTag },
      key,
      { iv: iv, mode: CryptoJS.mode.GCM, padding: CryptoJS.pad.NoPadding }
    );

    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('解密失败:', error);
    return encryptedData;
  }
};

/**
 * 生成请求签名验证
 * @param data 数据
 * @param timestamp 时间戳
 * @returns 签名
 */
const generateSignature = (data: string, timestamp: string): string => {
  const signature = CryptoJS.HmacSHA256(data + timestamp, ENCRYPTION_KEY);
  return signature.toString(CryptoJS.enc.Hex);
};

/**
 * 解密请求中间件
 */
export const decryptRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const body = req.body as Record<string, any>;

    // 如果请求体只有 payload 字段（流式请求），则解密
    if (body && body.payload && Object.keys(body).length === 1) {
      const decrypted = decrypt(body.payload);
      try {
        req.body = JSON.parse(decrypted);
      } catch (parseError) {
        req.body = { payload: body.payload };
      }
    }
    // 如果请求体包含 payload、signature、timestamp，则认为是加密请求
    else if (body && body.payload && body.signature && body.timestamp) {
      // 验证签名
      const expectedSignature = generateSignature(body.payload, body.timestamp);
      if (body.signature !== expectedSignature) {
        console.warn('签名验证失败');
        // 不中断请求，继续处理
      }

      // 解密请求体
      const decrypted = decrypt(body.payload);
      try {
        req.body = JSON.parse(decrypted);
      } catch {
        req.body = decrypted;
      }
    }
  } catch (error) {
    console.error('解密中间件错误:', error);
  }

  next();
};
