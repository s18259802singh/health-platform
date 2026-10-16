import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The normal build is split per route (see App.jsx): the landing page should
// not ship the whole admin console before it can draw anything.
//
// The standalone demo build is the exception. It is handed over as ONE file
// for a preview link, so it cannot fetch chunks at runtime — everything has
// to be inlined into a single bundle.
const DEMO = process.env.VITE_DEMO === 'true';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // matches CLIENT_URL in backend .env
  },
  build: DEMO
    ? { rollupOptions: { output: { inlineDynamicImports: true } }, cssCodeSplit: false }
    : {},
});
