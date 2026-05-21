// TODO: Vue3相关
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import path from 'path'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

// TODO: SVG图标
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

// TODO: element-plus自动按需引入
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// TODO: 检查插件转换
import Inspect from 'vite-plugin-inspect'


export default defineConfig({
  base: './',
  server: {
    proxy: {
      '/v1': {
        target: 'http://localhost',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [
    vue(),
    vueDevTools(),
    // TODO: SVG图标
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), 'src/assets/svg')],
      symbolId: 'icon-[dir]-[name]',
    }),
    // TODO: element-plus自动按需引入
    AutoImport({
      resolvers: [
        ElementPlusResolver(),
      ],
      dts: 'src/auto-imports.d.ts',
      imports: ['vue', 'vue-router', 'pinia'], // 自动导入 Vue/VueRouter/Pinia API
      eslintrc: {
        enabled: true
      }
    }),
    Components({
      extensions: ['vue', 'md'],
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      resolvers: [
        ElementPlusResolver({
          importStyle: 'sass',
          ssr: false,
        }),
      ],
      dts: 'src/components.d.ts',
    }),
    // TODO: 检查插件转换
    Inspect(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
