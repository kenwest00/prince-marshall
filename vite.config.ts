import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"
import { BLUEPRINT_GRID, BLUEPRINT_GRID_SIZE, blueprintDataUri } from "./src/lib/blueprint"

/** Inline the finished blueprint drawing into each page's arrival cover. */
function blueprintArrival(): Plugin {
  const bg =
    `background-color:#0a0a0a;background-image:${blueprintDataUri()},${BLUEPRINT_GRID};` +
    `background-size:min(92vmin,880px) auto,${BLUEPRINT_GRID_SIZE};background-position:center,0 0,0 0,0 0,0 0;` +
    `background-repeat:no-repeat,repeat,repeat,repeat,repeat;`
  return {
    name: 'pm-blueprint-arrival',
    transformIndexHtml(html) {
      return html.replace('background:#0a0a0a;pointer-events:none;animation:pm-arrive .6s .1s', `${bg}pointer-events:none;animation:pm-arrive .6s .3s`)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), blueprintArrival()],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        rideAlong: path.resolve(__dirname, 'ride-along/index.html'),
        kura: path.resolve(__dirname, 'kura/index.html'),
        systems: path.resolve(__dirname, 'systems/index.html'),
      },
    },
  },
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
