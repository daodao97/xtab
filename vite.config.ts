import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json' assert { type: 'json' } // Node >=17
import { resolve } from 'path'
import WindiCSS from 'vite-plugin-windicss'
import windiConfig from './windi.config'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import vueJsx from '@vitejs/plugin-vue-jsx'
import visualizer from 'rollup-plugin-visualizer'

const r = (...args: string[]) => resolve(__dirname, ...args)

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  delete manifest.chrome_url_overrides
  return {
    resolve: {
      alias: {
        '~': r('src')
      },
    },
    plugins: [
      vue(), 
      vueJsx(),
      crx({ manifest }),
      WindiCSS({
        config: windiConfig,
      }),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
      visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true
      })
    ],
    build: {
      sourcemap: false,
      rollupOptions: {
        input: {
          // newtab: r( 'pages/newtab/index.html'),
          popup: r('pages/popup/index.html'),
          // options: r('pages/options/index.html'),
          background: r('src/background/index.ts'),
          content: r('src/content/index.ts'),
        },
        output: {
          manualChunks: (id) => {
            if (id.includes("node_modules")) {
              const index = id.lastIndexOf("node_modules")
              const tmp = id.substring(index).split("/")
              const name = tmp[1]
              if (name.startsWith("@")) {
                return `${tmp[1]}_${tmp[2]}` 
              } else {
                return tmp[1]
              }
            }
          }
        }
      }
    }
  }
})
