import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, readdirSync } from 'fs'

export default defineConfig({
  plugins: [
    react(),
    {
      // Copy onnxruntime-web WASM binaries into dist/assets/ so the offscreen
      // document can load them at chrome-extension://id/assets/*.wasm.
      name: 'copy-ort-wasm',
      closeBundle() {
        const src = resolve(process.cwd(), 'node_modules/onnxruntime-web/dist')
        const dst = resolve(process.cwd(), 'dist/assets')
        mkdirSync(dst, { recursive: true })
        try {
          // onnxruntime-web needs both the .wasm binaries AND the .jsep.mjs module
          // (WebGPU execution provider). The dynamic import() inside the bundle
          // resolves relative to assets/, so all files must land there.
          const wasmFiles = readdirSync(src).filter(f => f.endsWith('.wasm') || f.endsWith('.mjs'))
          wasmFiles.forEach(f => copyFileSync(resolve(src, f), resolve(dst, f)))
          console.log(`[ERP] Copied ${wasmFiles.length} ort file(s) → dist/assets/`)
        } catch (e) {
          console.warn('[ERP] Could not copy WASM files (run npm install first):', e.message)
        }
      },
    },
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup/index.html'),
        intervention: resolve(__dirname, 'content/intervention.html'),
        offscreen: resolve(__dirname, 'offscreen/offscreen.html'),
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  resolve: {
    alias: {
      '@nlp': resolve(__dirname, 'src/nlp'),
    },
  },
})
