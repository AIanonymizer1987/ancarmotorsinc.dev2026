import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    define: {
      'process.env.EMAILJS_SERVICE_ID': JSON.stringify(env.EMAILJS_SERVICE_ID || env.VITE_EMAILJS_SERVICE_ID || ''),
      'process.env.EMAILJS_PUBLIC_KEY': JSON.stringify(env.EMAILJS_PUBLIC_KEY || env.VITE_EMAILJS_PUBLIC_KEY || ''),
      'process.env.EMAILJS_TEMPLATE_NOTIFICATION': JSON.stringify(env.EMAILJS_TEMPLATE_NOTIFICATION || env.VITE_EMAILJS_NOTIFICATION_TEMPLATE_ID || ''),
      'process.env.EMAILJS_TEMPLATE_RECEIPT': JSON.stringify(env.EMAILJS_TEMPLATE_RECEIPT || env.VITE_EMAILJS_RECEIPT_TEMPLATE_ID || ''),
    },
    server: {
    proxy: {
      '/api/neon': {
        target: 'http://127.0.0.1:8888',
        changeOrigin: true,
      },
    },
  },
  esbuild: {
    logOverride: {
      'ignored-directive': 'silent', 
    },
  },
  logLevel: 'info', 
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // ignore certain harmless warnings
        if (
          warning.message.includes('Module level directives') ||
          warning.message.includes('"use client"')  ||
          warning.message.includes('"was ignored"')
        ) {
          return; 
        }

        // FAIL build on unresolved imports
        if (warning.code === 'UNRESOLVED_IMPORT') {
          throw new Error(`Build failed due to unresolved import:\n${warning.message}`);
        }

        // FAIL build on missing exports (like your Input error)
        if (warning.code === 'PLUGIN_WARNING' && /is not exported/.test(warning.message)) {
          throw new Error(`Build failed due to missing export:\n${warning.message}`);
        }

        // other warnings: log normally
        warn(warning);
      },
    },
  },
  };
});