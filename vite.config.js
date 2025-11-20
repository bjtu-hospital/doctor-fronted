import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni(),
  ],
  server: {
    historyApiFallback: true,  // 支持 history 路由
    port: 3000, // 前端开发服务器端口
    host: 'localhost',
    strictPort: true, // 端口被占用时不自动改端口
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/,''),
      }
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
