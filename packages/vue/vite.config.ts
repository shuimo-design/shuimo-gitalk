import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'shuimo-gitalk-vue',
      formats: ['es'],
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
