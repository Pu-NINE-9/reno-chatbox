/**
 * TODO: 自动注册 ./config 下所有自定义指令
 * 规则：
 * 1. 文件名为：vXXX.ts → 指令名为 xxx（短横线）
 * 2. 直接导出 default 即可
 * 3. 新增指令只需创建文件，无需手动注册
 */
import type { App } from 'vue'

export function setupDirectives(app: App) {
  // 读取 config 目录下所有以 .ts 结尾的文件
  const directiveModules = import.meta.glob('./config/*.ts', { eager: true })

  // 遍历自动注册
  Object.keys(directiveModules).forEach((path) => {
    // 获取指令模块
    const module = directiveModules[path] as any
    const directive = module.default

    if (!directive) return

    // 从文件名提取指令名
    // 例子：vDebounce.ts → debounce
    const fileName = path.split('/').pop()!.replace('.ts', '')
    const directiveName = fileName
      .replace('v', '') // 去掉 v
      .replace(/([A-Z])/g, '-$1') // 驼峰转短横线
      .toLowerCase()
      .replace(/^-/, '') // 去掉开头的 -

    // 全局注册
    app.directive(directiveName, directive)
  })
}
