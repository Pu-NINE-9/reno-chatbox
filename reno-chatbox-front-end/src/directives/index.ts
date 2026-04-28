import type { App } from "vue"
import vAntiDebug from './vAntiDebug'
import vAntiCapture from './vAntiCapture'
import vXSS from "./vXss"

export function setupDirectives(app: App) {
  app.directive('anti-debug', vAntiDebug) // 注册防调试指令
  app.directive('anti-capture', vAntiCapture) // 注册防截屏+防右键指令
  app.directive('xss', vXSS) // 注册XSS攻击指令
}
