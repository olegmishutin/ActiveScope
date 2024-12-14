import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: '0.0.0.0',
        port: '5174',
        proxy: {
            '/api': {
                target: 'http://server:8080/',
                changeOrigin: true,
            },
            '/media': {
                target: 'http://server:8080/',
                changeOrigin: true,
            }
        }
    }
})
