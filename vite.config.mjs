// Plugins
import Components from "unplugin-vue-components/vite";
import Vue from "@vitejs/plugin-vue";
import Vuetify, { transformAssetUrls } from "vite-plugin-vuetify";
import ViteFonts from "unplugin-fonts/vite";

// Utilities
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

// Build timestamp plugin
const buildTimestampPlugin = () => {
  return {
    name: "build-timestamp",
    writeBundle() {
      const now = new Date();
      const timestamp =
        now.toLocaleDateString("en-GB") +
        " " +
        now.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });

      // Read the built index.html
      const indexPath = join(process.cwd(), "build", "index.html");
      try {
        let content = readFileSync(indexPath, "utf8");

        // Add timestamp to the top of the body
        content = content.replace(
          "<body>",
          `<body>\n    <div style="position: absolute; top: 0; left: 0; right: 0; background: #333; color: white; text-align: center; padding: 2px; font-size: 12px; z-index: 9999;">Build: ${timestamp}</div>`
        );

        writeFileSync(indexPath, content);
        console.log(`✓ Build timestamp added: ${timestamp}`);
      } catch (error) {
        console.warn("Could not add build timestamp:", error.message);
      }
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  base: "",
  plugins: [
    Vue({
      template: { transformAssetUrls },
    }),
    // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin#readme
    Vuetify(),
    Components(),
    ViteFonts({
      google: {
        families: [
          {
            name: "Roboto",
            styles: "wght@100;300;400;500;700;900",
          },
        ],
      },
    }),
    buildTimestampPlugin(),
  ],
  define: { "process.env": {} },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
    extensions: [".js", ".json", ".jsx", ".mjs", ".ts", ".tsx", ".vue"],
  },
  server: {
    port: 3000,
  },
  build: {
    outDir: "build", // Change 'dist' folder to 'build'
  },
});
