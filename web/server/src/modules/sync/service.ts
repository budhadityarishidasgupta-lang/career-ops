import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { eq } from "drizzle-orm";
import type { Database } from "../../db/client.js";
import { applications, sources } from "../../db/schema.js";
import {
  parseApplicationsMd,
  serializeApplicationsMd,
  parsePortalsYml,
} from "./parsers.js";

export class SyncService {
  constructor(
    private db: Database,
    private careerOpsRoot: string,
  ) {}

  async importFromMarkdown(): Promise<{ apps: number; sources: number }> {
    const appsMdPath = join(this.careerOpsRoot, "data", "applications.md");
    const portalsYmlPath = join(this.careerOpsRoot, "portals.yml");

    // Import applications
    let appsCount = 0;
    try {
      const mdContent = await readFile(appsMdPath, "utf-8");
      const parsed = parseApplicationsMd(mdContent);

      for (const app of parsed) {
        await this.db
          .insert(applications)
          .values({
            number: app.number,
            company: app.company,
            role: app.role,
            score: app.score,
            status: app.status,
            reportPath: app.reportPath,
            pdfGenerated: app.pdfGenerated,
            notes: app.notes,
            appliedAt: app.date ? new Date(app.date) : null,
          })
          .onConflictDoUpdate({
            target: applications.number,
            set: {
              company: app.company,
              role: app.role,
              score: app.score,
              status: app.status,
              reportPath: app.reportPath,
              pdfGenerated: app.pdfGenerated,
              notes: app.notes,
              appliedAt: app.date ? new Date(app.date) : null,
              updatedAt: new Date(),
            },
          });
        appsCount++;
      }
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    }

    // Import sources
    let sourcesCount = 0;
    try {
      const ymlContent = await readFile(portalsYmlPath, "utf-8");
      const parsedSources = parsePortalsYml(ymlContent);

      for (const src of parsedSources) {
        await this.db
          .insert(sources)
          .values({
            name: src.name,
            type: src.type,
            config: src.config,
            enabled: src.enabled,
          })
          .onConflictDoUpdate({
            target: sources.name,
            set: {
              type: src.type,
              config: src.config,
              enabled: src.enabled,
              updatedAt: new Date(),
            },
          });
        sourcesCount++;
      }
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    }

    return { apps: appsCount, sources: sourcesCount };
  }

  async exportToMarkdown(): Promise<void> {
    const rows = await this.db
      .select()
      .from(applications)
      .orderBy(applications.number);

    const parsed = rows.map((row) => ({
      number: row.number,
      date: row.appliedAt
        ? row.appliedAt.toISOString().slice(0, 10)
        : row.createdAt.toISOString().slice(0, 10),
      company: row.company,
      role: row.role,
      score: row.score ?? null,
      status: row.status,
      pdfGenerated: row.pdfGenerated,
      reportPath: row.reportPath ?? null,
      notes: row.notes ?? "",
    }));

    const content = serializeApplicationsMd(parsed);
    const appsMdPath = join(this.careerOpsRoot, "data", "applications.md");
    await writeFile(appsMdPath, content, "utf-8");
  }

  async getSyncStatus(): Promise<{ apps: number; sources: number }> {
    const [appsResult, sourcesResult] = await Promise.all([
      this.db.select({ id: applications.id }).from(applications),
      this.db.select({ id: sources.id }).from(sources),
    ]);

    return {
      apps: appsResult.length,
      sources: sourcesResult.length,
    };
  }
}
