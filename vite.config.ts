import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    // 监听所有IP地址
    host: "0.0.0.0",
    // 指定dev sever的端口号，默认为 5173
    port: 3000,
    // 自动打开浏览器运行以下路径的页面
    open: "/",
  },
  plugins: [
    cloudflare({
      viteEnvironment: { name: "ssr" },
    }),
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
  ],
  build: {
    minify: true,
  },
});
