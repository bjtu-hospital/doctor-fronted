import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni(),
  ],
  server: {
    historyApiFallback: true,  // 支持 history 路由
    port: 3000, // 改成其他端口
    host: '0.0.0.0',
    proxy: {
      // 代理所有 /api 请求到后端服务器
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
