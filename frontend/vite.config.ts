import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Define global constants for different environments
    __API_BASE_URL__: JSON.stringify(
      process.env.NODE_ENV === 'production' 
        ? 'https://kwcow8kok4s448sw4s8wo8cc.5.78.137.10.sslip.io/api'
        : 'http://127.0.0.1:8000/api'
    )
  }
});
