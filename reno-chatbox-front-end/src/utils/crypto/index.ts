// 加密工具 - 使用 AES-GCM 加密
import CryptoJS from 'crypto-js'

// 加密密钥（从环境变量获取，确保前后端一致）
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY

/**
 * AES 加密
 * @param data 要加密的数据
 * @returns 加密后的字符串
 */
export const encrypt = (data: string): string => {
  try {
    const iv = CryptoJS.lib.WordArray.random(12) // 12 bytes for GCM
    const key = CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY.padEnd(32, '\0').slice(0, 32)) // 确保 32 字节

    const encrypted = CryptoJS.AES.encrypt(data, key, {
      iv: iv,
      mode: CryptoJS.mode.GCM,
      padding: CryptoJS.pad.NoPadding,
    })

    // 返回 IV + 密文 + 认证标签
    return iv.toString(CryptoJS.enc.Base64) + ':' + encrypted.ciphertext.toString(CryptoJS.enc.Base64) + ':' + encrypted.authTag.toString(CryptoJS.enc.Base64)
  } catch (error) {
    console.error('加密失败:', error)
    return data // 降级返回原数据
  }
}

/**
 * AES 解密
 * @param encryptedData 加密的字符串
 * @returns 解密后的数据
 */
export const decrypt = (encryptedData: string): string => {
  try {
    const [ivStr, ciphertextStr, authTagStr] = encryptedData.split(':')
    if (!ivStr || !ciphertextStr || !authTagStr) {
      return encryptedData
    }

    const iv = CryptoJS.enc.Base64.parse(ivStr)
    const ciphertext = CryptoJS.enc.Base64.parse(ciphertextStr)
    const authTag = CryptoJS.enc.Base64.parse(authTagStr)
    const key = CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY.padEnd(32, '\0').slice(0, 32))

    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: ciphertext, authTag: authTag },
      key,
      { iv: iv, mode: CryptoJS.mode.GCM, padding: CryptoJS.pad.NoPadding }
    )

    return decrypted.toString(CryptoJS.enc.Utf8)
  } catch (error) {
    console.error('解密失败:', error)
    return encryptedData // 降级返回原数据
  }
}

/**
 * 生成请求签名（用于防止篡改）
 * @param data 请求数据
 * @param timestamp 时间戳
 * @returns 签名
 */
export const generateSignature = (data: string, timestamp: string): string => {
  const signature = CryptoJS.HmacSHA256(data + timestamp, ENCRYPTION_KEY)
  return signature.toString(CryptoJS.enc.Hex)
}

/**
 * 加密请求数据
 * @param data 请求体
 * @returns 加密后的请求对象
 */
export const encryptRequest = (data: any): { payload: string; signature: string; timestamp: string } => {
  const timestamp = Date.now().toString()
  const jsonData = JSON.stringify(data)
  const payload = encrypt(jsonData)
  const signature = generateSignature(payload, timestamp)

  return { payload, signature, timestamp }
}

/**
 * 解密响应数据
 * @param payload 加密的响应数据
 * @returns 解密后的数据
 */
export const decryptResponse = (payload: string): any => {
  try {
    const decrypted = decrypt(payload)
    return JSON.parse(decrypted)
  } catch {
    return payload
  }
}
