import type { RouteRecordRaw, RouteMeta } from 'vue-router'

export const getRouteConfig = (): RouteRecordRaw[] => {
  const components = import.meta.glob(`/src/views/**/index.vue`)
  const routeConfig = Object.entries(import.meta.glob(`/src/views/**/page.ts`, {
    eager: true,
    import: 'default'
  }))
  const route: RouteRecordRaw[] = []

  for (const [halfRoute, meta] of routeConfig) {
    // 1. 获取路由名，不存在就跳过
    const routeName = halfRoute.split('/').at(-2)
    if (!routeName) continue

    // 2. 获取组件
    const componentPath = halfRoute.replace('page.ts', 'index.vue')
    const component = components[componentPath]
    if (!component) continue

    // 推入路由
    route.push({
      name: routeName,
      path: `/${routeName}`,
      component: component,
      meta: meta as RouteMeta
    })
  }

  route.unshift({
    path: '/',
    redirect: '/dashboard',
  })

  return route
}
