import path from 'path'
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
      name: 'shuimo-gitalk-vue',
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      external: ['vue', 'axios'],
      output: {
        globals: {
          vue: 'Vue',
          axios: 'axios'
        },
      },
    },
  },
  plugins: [
    Vue(),
    vueJsx()
  ],
})
