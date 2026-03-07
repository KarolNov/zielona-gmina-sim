import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const config = defineConfig({
	plugins: [
		devtools(),
		cloudflare({ viteEnvironment: { name: "ssr" } }),
		tsconfigPaths({ projects: ["./tsconfig.json"] }),
		tailwindcss(),
		tanstackStart(),
		viteReact(),
	],
	server: {
		// Dev-only proxy to bypass CORS when calling the JRC PVGIS API from the browser.
		// Requests to /api/pvgis/* will be proxied to https://re.jrc.ec.europa.eu/api/v5_2/*
		proxy: {
			"/api/pvgis": {
				target: "https://re.jrc.ec.europa.eu",
				changeOrigin: true,
				secure: true,
				// rewrite /api/pvgis/seriescalc -> /api/v5_2/seriescalc
				rewrite: (path) => path.replace(/^\/api\/pvgis/, "/api/v5_2"),
			},
		},
	},
});

export default config;
