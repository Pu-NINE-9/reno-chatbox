import { Upload } from 'tus-js-client'

type UploadStatus = 'start' | 'progress' | 'success' | 'error'
type UploadCallback = (status: UploadStatus, percent?: number) => void

export const uploadFileAPI = async (file: File, callback: UploadCallback) => {
  if (!file) return

  await new Promise<void>((resolve, reject) => {
    const upload = new Upload(file, {
      endpoint: '/api/upload/chunk',
      chunkSize: 2 * 1024 * 1024,
      retryDelays: [0, 1000, 2000],
      metadata: {
        filename: file.name,
        filetype: file.type
      },
      onProgress(uploadedBytes, totalBytes) {
        const pct = Math.round((uploadedBytes / totalBytes) * 100)
        callback('progress', pct)
      },
      onSuccess() {
        console.log('上传成功', upload.url)
        callback('success')
        resolve()
      },
      onError(err) {
        console.error('上传失败', err)
        callback('error')
        reject(err)
      }
    })
    callback('start')
    upload.start()
  })
}