import type { FastifyInstance } from "fastify";
import { resolve } from "path";
import { SyncService } from "./service.js";

export async function syncRouter(app: FastifyInstance) {
  const getService = () =>
    new SyncService(app.db, resolve(app.env.CAREER_OPS_ROOT));

  app.post("/api/sync/import", async (_request, reply) => {
    const service = getService();
    const result = await service.importFromMarkdown();
    return reply.send({ success: true, imported: result });
  });

  app.post("/api/sync/export", async (_request, reply) => {
    const service = getService();
    await service.exportToMarkdown();
    return reply.send({ success: true });
  });

  app.get("/api/sync/status", async (_request, reply) => {
    const service = getService();
    const status = await service.getSyncStatus();
    return reply.send(status);
  });
}
