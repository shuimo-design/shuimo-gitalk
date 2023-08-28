/// <reference types="vite" />

import path from 'path'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig({
  plugins: [
    Vue(),
    // https://github.com/antfu/unplugin-auto-import
    AutoImport({
      imports: [
        'vue'
      ],
      dts: true,
    }),
    // https://github.com/antfu/vite-plugin-components
    Components({
      dts: true,
    }),
  ],
})
