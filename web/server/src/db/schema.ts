import {
  pgTable, uuid, integer, varchar, text, boolean, timestamp, decimal, jsonb,
} from "drizzle-orm/pg-core";

export const applications = pgTable("applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  number: integer("number").notNull().unique(),
  company: varchar("company", { length: 255 }).notNull(),
  role: varchar("role", { length: 500 }).notNull(),
  score: decimal("score", { precision: 2, scale: 1 }),
  status: varchar("status", { length: 50 }).notNull().default("Evaluated"),
  url: varchar("url", { length: 2048 }),
  reportPath: varchar("report_path", { length: 500 }),
  pdfGenerated: boolean("pdf_generated").notNull().default(false),
  notes: text("notes"),
  appliedAt: timestamp("applied_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const statusHistory = pgTable("status_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id").notNull().references(() => applications.id, { onDelete: "cascade" }),
  fromStatus: varchar("from_status", { length: 50 }),
  toStatus: varchar("to_status", { length: 50 }).notNull(),
  changedAt: timestamp("changed_at", { withTimezone: true }).notNull().defaultNow(),
  source: varchar("source", { length: 20 }).notNull().default("dashboard"),
});

export const sources = pgTable("sources", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  type: varchar("type", { length: 50 }).notNull(),
  config: jsonb("config").notNull().default({}),
  enabled: boolean("enabled").notNull().default(true),
  lastScannedAt: timestamp("last_scanned_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const discoveredJobs = pgTable("discovered_jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 500 }).notNull(),
  company: varchar("company", { length: 255 }).notNull(),
  url: varchar("url", { length: 2048 }).notNull().unique(),
  sourceId: uuid("source_id").references(() => sources.id, { onDelete: "set null" }),
  location: varchar("location", { length: 255 }),
  postedAt: timestamp("posted_at", { withTimezone: true }),
  rawData: jsonb("raw_data"),
  status: varchar("status", { length: 50 }).notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
