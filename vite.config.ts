import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "apple-touch-icon.svg"],
      manifest: {
        name: "말랑톡",
        short_name: "말랑톡",
        description: "보내기 전에, 한 번만 눌러보세요. 마음을 부드럽게 다듬어 주는 메시지 코치.",
        theme_color: "#FF7AA2",
        background_color: "#FFFFFF",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        lang: "ko",
        icons: [
          {
            src: "/icon-192.svg",
            sizes: "192x192",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
          {
            src: "/icon-512.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,webmanifest}"],
        navigateFallback: "/index.html",
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/generativelanguage\.googleapis\.com\/.*/,
            handler: "NetworkOnly",
          },
        ],
      },
    }),
  ],
  server: {
    host: "127.0.0.1",
    port: 5173,
  },
});
