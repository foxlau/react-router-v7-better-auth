import { reactRouter } from "@react-router/dev/vite";
import { cloudflareDevProxy } from "@react-router/dev/vite/cloudflare";
import tailwindcss from "@tailwindcss/vite";
import { sessionContextPlugin } from "session-context/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { getLoadContext } from "./workers/load-context";

export default defineConfig({
  plugins: [
    cloudflareDevProxy({ getLoadContext }),
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    sessionContextPlugin(),
  ],
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
