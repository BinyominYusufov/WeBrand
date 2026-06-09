import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// Admin panel runs on its OWN port (5174), separate from the public site (5173).
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5174,
        strictPort: true,
    },
});
