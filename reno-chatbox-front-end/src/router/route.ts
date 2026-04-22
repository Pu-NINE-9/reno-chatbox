// TODO: 路由配置
import { getRouteConfig } from '@/composables'
import type { RouteRecordRaw } from 'vue-router' // 路由配置类型的ts定义，包括了meta、name等

export const routes: RouteRecordRaw[] = getRouteConfig()
