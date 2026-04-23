import type { RouteRecordRaw, RouteMeta } from 'vue-router'

export const getRouteConfig = (): RouteRecordRaw[] => {
  const components = import.meta.glob(`/src/views/**/index.vue`) // 得到的是导入函数的对象数组
  // 得到的是路径和page.ts里默认导出的内容
  const routeConfig = Object.entries(import.meta.glob(`/src/views/**/page.ts`, {
    eager: true,
    import: 'default'
  }))

  const routeMap: Record<string, RouteRecordRaw> = {} // 用来存储所有路由，自动生成父子结构

  for (const [filePath, meta] of routeConfig) {
    if (filePath.includes('/components/')) continue // 自动排除components目录

    // TODO: 提取路由层级
    const match = filePath.match(/views\/(.+)\/page\.ts/) // 正则提取目录层级（/src/views/system/user/page.ts → "system/user"）
    const uniqueKey = match?.[1]
    if (!uniqueKey) continue

    // TODO: 得到路由名称
    const routeName = uniqueKey.split('/').at(-1) // 路由名（最后一段文件夹）
    if (!routeName) continue

    // TODO: 组件
    const componentPath = filePath.replace('page.ts', 'index.vue')
    const component = components[componentPath]
    if (!component) continue

    // TODO: 构建路由
    const route: RouteRecordRaw = {
      name: uniqueKey.replaceAll('/', '-'), // 防止重名
      path: (uniqueKey.includes('/') ? routeName : `/${routeName}`).replace(/\[(\w+)\]/g, ':$1'), // 可以处理动态路由
      component: component,
      meta: meta as RouteMeta,
      children: [],
    }

    // TODO: 判断父子路由（有子层级，找父级）
    if (uniqueKey.includes('/')) {
      /**
       * slice(0, -1)是指去掉最后一个，保留前面所有
       * 数组里只有1个元素：join('/')不会出现/
       * 数组里≥2个元素：join('/')才会加/分隔
       */
      const parentKey = uniqueKey.split('/').slice(0, -1).join('/')
      if (routeMap[parentKey]) {
        routeMap[parentKey].children!.push(route)
      }
    } else {
      // 一级路由
      routeMap[uniqueKey] = route
    }
  }

  // TODO: 最终路由
  const routes = Object.values(routeMap)

  // 根重定向
  routes.unshift({ path: '/', redirect: '/dashboard' })

  return routes
}
