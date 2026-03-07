import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [
		devtools(),
		tsconfigPaths(),
		tailwindcss(),
		tanstackStart(),
		viteReact(),
	],
	server: {
		proxy: {
			// To działa TYLKO lokalnie w `npm run dev`
			"/api/pvgis": {
				target: "https://re.jrc.ec.europa.eu",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api\/pvgis/, "/api/v5_2"),
			},
		},
	},
});
