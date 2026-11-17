import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Served from https://<user>.github.io/signal-message-formatter/ on GitHub Pages.
  base: '/signal-message-formatter/',
  plugins: [react()],
});
