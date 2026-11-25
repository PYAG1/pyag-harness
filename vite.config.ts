import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";
import { electrobunViteAliases } from "./.hutch/devkit/api/config/electrobun-vite";

function csp(): Plugin {
	return {
		name: "agent-studio-csp",
		apply: "build",
		transformIndexHtml: (html) =>
			html.replace(
				"<head>",
				`<head>\n    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:" />`,
			),
	};
}

export default defineConfig({
	plugins: [react(), tailwindcss(), csp()],
	resolve: {
		alias: [
			{ find: "@", replacement: resolve(__dirname, "src/mainview") },
			...electrobunViteAliases(resolve(__dirname, ".hutch/devkit")),
		],
	},
	root: "src/mainview",
	build: {
		outDir: "../../dist",
		emptyOutDir: true,
	},
	server: {
		port: 5173,
		strictPort: true,
	},
});
