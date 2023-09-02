import path from 'node:path'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'shuimo-gitalk',
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      external: ['vue', 'axios', 'shuimo-ui'],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
          axios: 'axios',
          'shuimo-ui': 'shuimo-ui',
        },
      },
    },
  },
  plugins: [Vue(), vueJsx()],
})
