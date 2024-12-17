import { reactRouter } from "@react-router/dev/vite";
import { cloudflareDevProxy } from "@react-router/dev/vite/cloudflare";

import { sessionContextPlugin } from "session-context/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";

import { getLoadContext } from "./workers/load-context";

export default defineConfig({
  plugins: [
    cloudflareDevProxy({ getLoadContext }),
    reactRouter(),
    tsconfigPaths(),
    sessionContextPlugin(),
  ],
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  ssr: {
    resolve: {
      conditions: ["workerd", "worker", "browser"],
      externalConditions: ["workerd", "worker"],
    },
  },
  resolve: {
    mainFields: ["browser", "module", "main"],
  },
  build: {
    minify: true,
  },
});
