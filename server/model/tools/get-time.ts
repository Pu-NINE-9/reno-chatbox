// 导入langchain‑js用于创建工具的tool构造函数
import { tool } from "@langchain/core/tools"
// zod 用于校验工具入参、自动生成function‑call参数JSON结构
import { z } from "zod"

/**
 * 获取服务器当前北京时间 工具
 * tool() 是LangChain封装的快速创建工具的方法
 * 第一个参数：异步执行函数，也就是工具真正运行的业务代码
 * 第二个参数：工具配置对象，大模型依靠这些信息判断什么时候调用该函数
 */
export const getCurrentTime = tool(async () => {
  return new Date().toLocaleString("zh-CN") // toLocaleString("zh-CN") 按照中国时区、中文格式输出日期+时间
}, {
  name: "get_current_time", // 工具名称，大模型发起函数调用时，会携带这个name用来指定调用哪一个工具

  /**
   * 工具描述（最重要！）
   * 大模型依靠阅读description，判断用户问题是否需要触发当前工具
   * 描述尽量写清楚功能、触发场景，描述含糊会导致模型不会调用或者乱调用工具
   */
  description: "获取服务器当前的北京时间，用户询问几点、当前日期、现在时间的时候调用",

  /**
   * schema 使用zod定义工具需要接收的入参结构
   * z.object({}) 代表该工具不需要传入任何参数
   * 如果后续需要参数，例如查询指定日期，则可以写成
   * schema: z.object({
   *     targetDay: z.string().describe("需要查询的目标日期")
   * })
   * describe() 用来给大模型说明每一个参数的作用
   */
  schema: z.object({})
})
