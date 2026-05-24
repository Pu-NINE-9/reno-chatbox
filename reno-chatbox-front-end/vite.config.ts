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

export default defineConfig(({ command, mode }) => {
  const isBuild = command === 'build'
  const isProd = mode === 'production'

  return {
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
        include: [
          /\.vue$/,
          /\.vue\?vue/,
          /\.md$/,
          path.resolve(__dirname, 'src/**/*.vue'),
          path.resolve(__dirname, 'src/**/*.md'),
        ],
        resolvers: [
          ElementPlusResolver({
            importStyle: 'sass',
            ssr: false,
          }),
        ],
        dts: 'src/components.d.ts',
        directoryAsNamespace: true,
        logLevel: isProd ? 'error' : 'debug',
      }),
      // TODO: 检查插件转换
      Inspect(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    // TODO: 构建优化配置
    build: {
      // 输出目录
      outDir: 'dist',
      // 压缩配置
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: isProd, // 生产环境移除 console
          drop_debugger: isProd, // 生产环境移除 debugger
          pure_funcs: isProd ? ['console.log', 'console.info', 'console.debug'] : [],
        },
        format: {
          comments: false, // 移除注释
        },
      },
      // 源映射
      sourcemap: !isProd,
      // 资源文件大小警告
      chunkSizeWarningLimit: 1500, // 1.5kb
      // 分包策略
      rollupOptions: {
        output: {
          // 输入文件名
          entryFileNames: 'assets/js/[name]-[hash].js',
          // 输出文件名
          chunkFileNames: 'assets/js/[name]-[hash].js',
          // 资源文件名
          assetFileNames: (assetInfo) => {
            const extType = path.extname(assetInfo.name || '').toLowerCase()
            if (/\.css$/.test(extType)) return 'assets/css/[name]-[hash][extname]'
            if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(extType)) return 'assets/images/[name]-[hash][extname]'
            if (/\.(woff2?|eot|ttf|otf)$/.test(extType)) return 'assets/fonts/[name]-[hash][extname]'
            return 'assets/[name]-[hash][extname]'
          },
          // 分包策略 - 函数形式（Vite 8 + Rolldown 要求）
          manualChunks(id) {
            if (!id.includes('node_modules')) return

            // Vue 生态
            if (/\/node_modules\/vue(\/|\/dist\/|\/router\/|\/i18n\/|$)/.test(id) ||
                /\/node_modules\/@vue\/|\/node_modules\/pinia/.test(id)) {
              return 'vue-vendor'
            }

            // Element Plus
            if (/\/node_modules\/element-plus\//.test(id)) {
              return 'element-plus'
            }

            // ECharts
            if (/\/node_modules\/echarts(\/|$)/.test(id)) {
              return 'echarts'
            }

            // 工具库
            if (/\/node_modules\/(axios|lodash|@vueuse|lodash-es)/.test(id)) {
              return 'utils'
            }

            // 代码高亮
            if (/\/node_modules\/highlight\.js/.test(id)) {
              return 'highlight'
            }
          },
        },
        // Tree Shaking 优化
        treeshake: {
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          unknownGlobalSideEffects: false,
        },
      },
      // 报告生成
      reportCompressedSize: true,
    },
    // TODO: 预构建优化
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        'pinia',
        'vue-i18n',
        'element-plus',
        'axios',
        'lodash-es',
        'echarts',
        '@microsoft/fetch-event-source',
      ],
      exclude: [],
    },
  }
})
