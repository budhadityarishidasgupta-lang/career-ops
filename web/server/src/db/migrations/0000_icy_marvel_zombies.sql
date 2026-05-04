CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"number" integer NOT NULL,
	"company" varchar(255) NOT NULL,
	"role" varchar(500) NOT NULL,
	"score" numeric(2, 1),
	"status" varchar(50) DEFAULT 'Evaluated' NOT NULL,
	"url" varchar(2048),
	"report_path" varchar(500),
	"pdf_generated" boolean DEFAULT false NOT NULL,
	"notes" text,
	"applied_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "applications_number_unique" UNIQUE("number")
);
--> statement-breakpoint
CREATE TABLE "discovered_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(500) NOT NULL,
	"company" varchar(255) NOT NULL,
	"url" varchar(2048) NOT NULL,
	"source_id" uuid,
	"location" varchar(255),
	"posted_at" timestamp with time zone,
	"raw_data" jsonb,
	"status" varchar(50) DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "discovered_jobs_url_unique" UNIQUE("url")
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"last_scanned_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sources_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"from_status" varchar(50),
	"to_status" varchar(50) NOT NULL,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"source" varchar(20) DEFAULT 'dashboard' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "discovered_jobs" ADD CONSTRAINT "discovered_jobs_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "status_history" ADD CONSTRAINT "status_history_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;