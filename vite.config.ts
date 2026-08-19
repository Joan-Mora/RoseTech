import type { IncomingMessage, ServerResponse } from "node:http";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const api = "http://127.0.0.1:8787";

function apiProxy() {
  return {
    target: api,
    changeOrigin: true,
    configure(proxy: {
      on: (event: "error", fn: (err: Error, _req: IncomingMessage, res: ServerResponse) => void) => void;
    }) {
      proxy.on("error", (_err, _req, res) => {
        if (res && !res.headersSent && typeof res.writeHead === "function") {
          res.writeHead(503, { "Content-Type": "application/json; charset=utf-8" });
          res.end(
            JSON.stringify({
              error:
                "La API de contacto no está en ejecución. Inicie el sitio con npm run dev (api + web).",
            }),
          );
        }
      });
    },
  };
}

const securityHeaders = {
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
};

export default defineConfig({
  plugins: [react()],
  base: "./",
  server: {
    headers: securityHeaders,
    proxy: {
      "/api": apiProxy(),
    },
  },
  preview: {
    headers: securityHeaders,
    proxy: {
      "/api": apiProxy(),
    },
  },
});
