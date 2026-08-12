import pino from "pino"
import path from "path"
import fs from "fs"

// 定义日志文件夹路径
const logDir = path.resolve("./logs")
// 文件夹不存在就手动创建
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true })
}

const logger = pino({
  level: "debug",
  transport: {
    targets: [
      {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss"
        }
      },
      {
        target: "pino-roll",
        options: {
          file: path.resolve(logDir, "app"),
          frequency: "daily",
          size: "10M",
          maxFiles: "14d",
          extension: ".log"
        }
      }
    ]
  }
})

export default logger