import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

const DOCKERIZED = true

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: '0.0.0.0',
        port: '5174',
        proxy: {
            '/api': {
                target: `http://${DOCKERIZED ? 'server' : 'localhost'}:8080/`,
                changeOrigin: true,
            },
            '/media': {
                target: `http://${DOCKERIZED ? 'server' : 'localhost'}:8080/`,
                changeOrigin: true,
            }
        }
    }
})
