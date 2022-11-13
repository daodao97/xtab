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
import vueJsx from '@vitejs/plugin-vue-jsx';

const r = (...args: string[]) => resolve(__dirname, ...args)

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
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
    ],
    build: {
      sourcemap: false,
      rollupOptions: {
        input: {
          newtab: r( 'pages/newtab/index.html'),
          popup: r('pages/popup/index.html'),
          options: r('pages/options/index.html'),
          background: r('src/background/index.ts'),
          content: r('src/content/index.ts'),
        },
        output: {
          entryFileNames: (info) => {
            return 'assets/[name].[hash].js'
          }
        }
      }
    }
  }
})
