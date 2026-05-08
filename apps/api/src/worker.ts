import { createServer, type Server } from "node:http";
import { createEmailWorker } from "./queues/email.worker.js";
import { redisConnection } from "./queues/redis.js";
import { logger } from "./lib/logger.js";
import { config } from "./config.js";

// Worker BullMQ não tem porta HTTP por natureza, mas o Coolify (e qualquer
// orquestrador que use healthcheck TCP/HTTP) exige uma porta exposta. Subimos
// um servidor mínimo com /health pra satisfazer o healthcheck — sem
// dependência extra, usando o `http` nativo do Node.
//
// Usamos `config.PORT` direto: o Coolify injeta PORT a partir do "Ports
// Exposes" do service. Assim o worker escuta exatamente onde o orquestrador
// vai sondar — sem a complexidade de uma porta separada.
function startHealthServer(isReady: () => boolean): Server {
  const server = createServer((req, res) => {
    if (req.url === "/health" || req.url === "/") {
      const ok = isReady();
      res.writeHead(ok ? 200 : 503, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: ok ? "ok" : "starting" }));
      return;
    }
    res.writeHead(404);
    res.end();
  });
  server.listen(config.PORT, config.HOST, () => {
    logger.info(
      { port: config.PORT, host: config.HOST },
      "Worker health endpoint pronto",
    );
  });
  return server;
}

async function main() {
  let ready = false;
  const healthServer = startHealthServer(() => ready);

  const worker = createEmailWorker();
  ready = true;
  logger.info("Email worker iniciado");

  const shutdown = async (signal: string) => {
    logger.info({ signal }, "Shutting down worker");
    ready = false;
    await worker.close();
    await redisConnection.quit();
    healthServer.close();
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));

  worker.on("failed", (job, err) => {
    logger.error({ jobId: job?.id, err }, "Job falhou");
  });
}

void main();
