import path from "node:path";
import type { IncomingMessage } from "node:http";
import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import miniReportHandler from "./api/mini-relatorio.ts";

function readRequestBody(request: IncomingMessage) {
  return new Promise<string>((resolve, reject) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function miniReportApiPlugin(): Plugin {
  return {
    name: "pinheiro-azul-mini-report-api",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        if (request.url?.split("?")[0] !== "/api/mini-relatorio") {
          next();
          return;
        }

        try {
          const body = await readRequestBody(request);
          await miniReportHandler(
            {
              method: request.method,
              headers: request.headers,
              body,
            },
            {
              status(code) {
                response.statusCode = code;
                return this;
              },
              json(payload) {
                response.setHeader("Content-Type", "application/json; charset=utf-8");
                response.end(JSON.stringify(payload));
              },
              setHeader(name, value) {
                response.setHeader(name, value);
              },
            }
          );
        } catch (error) {
          console.error("[vite] Falha no endpoint /api/mini-relatorio:", error);
          if (!response.headersSent) {
            response.statusCode = 500;
            response.setHeader("Content-Type", "application/json; charset=utf-8");
          }
          response.end(JSON.stringify({ error: "Falha interna no servidor de desenvolvimento." }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  for (const name of ["GROQ_API_KEY", "GROQ_MODEL"]) {
    if (env[name]) process.env[name] = env[name];
  }

  return {
    plugins: [react(), miniReportApiPlugin()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
