import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const webSearch = tool(async ({ query }) => {
  // 调用 duckduckgo 免费公开搜索接口
  const res = await fetch(`https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`) // 调用免费DuckDuckGo网页接口
  const html = await res.text()
  // 简单正则提取标题和链接
  const list:string[] = []
  const reg = /<a class="result__a" href="([^"]+)">(.+?)<\/a>/g
  let match
  while((match = reg.exec(html)) !== null){
    list.push(`标题：${match[2]}，链接：${match[1]}`)
  }
  return list.join("\n")
},{
  name:"web_search",
  description:"遇到实时资讯、天气、新闻、最新资料的时候调用网络搜索",
  schema:z.object({
    query:z.string().describe("搜索关键词")
  })
})
