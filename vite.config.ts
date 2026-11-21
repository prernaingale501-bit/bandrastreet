import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/bandrastreet/' : '/',
  plugins: [react()],
  server: {
    port: 7689,
    strictPort: true,
  },
}));
