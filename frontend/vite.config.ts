import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	server: {
		// Expose on the LAN so the game can be tested on a phone
		host: true,
		proxy: {
			'/api': 'http://localhost:3000',
		},
	},
})
