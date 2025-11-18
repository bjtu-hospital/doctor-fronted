import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni(),
  ],
  server: {
    historyApiFallback: true,  // 支持 history 路由
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
