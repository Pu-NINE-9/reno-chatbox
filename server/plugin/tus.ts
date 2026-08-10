import { Server } from '@tus/server'
import { FileStore } from '@tus/file-store'
import { EVENTS } from '@tus/utils'

const tusServer = new Server({
  datastore: new FileStore({
    directory: './.upload-tmp'
  }),
  path: '/api/upload/chunk'
})

tusServer.on(EVENTS.POST_FINISH, (_req, _res, upload) => {
  console.log('上传完成 -> 文件名:', upload.metadata?.filename)
  console.log('上传完成 -> 大小(字节):', upload.size)
  console.log('上传完成 -> tusId:', upload.id)
})

export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('request', async (event: any) => {
    const url = event.node.req.url || ''
    if (url.startsWith('/api/upload/chunk')) {
      await tusServer.handle(event.node.req, event.node.res)
    }
  })
})