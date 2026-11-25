import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router";

import "@fontsource/jetbrains-mono/latin-400.css";
import "@fontsource/jetbrains-mono/latin-500.css";
import "./styles/globals.css";

import { applyTheme } from "@/lib/theme";
import App from "./App";

applyTheme();

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<HashRouter>
			<App />
		</HashRouter>
	</StrictMode>,
);
