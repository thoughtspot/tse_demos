import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    // Let the ThoughtSpot embed iframe (different origin) fetch a self-hosted
    // brand font referenced via customCSSUrl (/embed-font.css -> /<font>.woff2).
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  preview: {
    headers: { 'Access-Control-Allow-Origin': '*' },
  }
})
