CREATE TYPE "public"."modality" AS ENUM('pregao', 'concorrencia', 'tomada_precos', 'convite', 'concurso', 'leilao', 'dispensa', 'inexigibilidade');--> statement-breakpoint
CREATE TYPE "public"."stage_status" AS ENUM('pending', 'active', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."supplier_status" AS ENUM('pending', 'qualified', 'disqualified');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'manager', 'viewer');--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"organ_id" integer,
	"process_id" integer,
	"action" varchar(50) NOT NULL,
	"details" text,
	"ip_address" varchar(45),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bidding_processes" (
	"id" serial PRIMARY KEY NOT NULL,
	"organ_id" integer NOT NULL,
	"number" varchar(50) NOT NULL,
	"year" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"modality" "modality" NOT NULL,
	"value" varchar(50),
	"opening_date" timestamp,
	"closing_date" timestamp,
	"current_stage_id" integer,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"process_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"url" text NOT NULL,
	"uploaded_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organs" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"cnpj" varchar(18) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"address" text,
	"city" varchar(100),
	"state" varchar(2),
	"phone" varchar(20),
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organs_cnpj_unique" UNIQUE("cnpj"),
	CONSTRAINT "organs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "process_stages" (
	"id" serial PRIMARY KEY NOT NULL,
	"process_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"order" integer NOT NULL,
	"status" "stage_status" DEFAULT 'pending' NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_name" varchar(255) NOT NULL,
	"cnpj" varchar(18) NOT NULL,
	"trade_name" varchar(255),
	"email" varchar(255),
	"phone" varchar(20),
	"address" text,
	"city" varchar(100),
	"state" varchar(2),
	"status" "supplier_status" DEFAULT 'pending' NOT NULL,
	"qualification_docs" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "suppliers_cnpj_unique" UNIQUE("cnpj")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'viewer' NOT NULL,
	"organ_id" integer,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_organ_id_organs_id_fk" FOREIGN KEY ("organ_id") REFERENCES "public"."organs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_process_id_bidding_processes_id_fk" FOREIGN KEY ("process_id") REFERENCES "public"."bidding_processes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bidding_processes" ADD CONSTRAINT "bidding_processes_organ_id_organs_id_fk" FOREIGN KEY ("organ_id") REFERENCES "public"."organs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_process_id_bidding_processes_id_fk" FOREIGN KEY ("process_id") REFERENCES "public"."bidding_processes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "process_stages" ADD CONSTRAINT "process_stages_process_id_bidding_processes_id_fk" FOREIGN KEY ("process_id") REFERENCES "public"."bidding_processes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_organ_id_organs_id_fk" FOREIGN KEY ("organ_id") REFERENCES "public"."organs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "logs_organ_idx" ON "activity_logs" USING btree ("organ_id");--> statement-breakpoint
CREATE INDEX "processes_organ_idx" ON "bidding_processes" USING btree ("organ_id");--> statement-breakpoint
CREATE UNIQUE INDEX "processes_number_year_idx" ON "bidding_processes" USING btree ("number","year");--> statement-breakpoint
CREATE UNIQUE INDEX "organs_cnpj_idx" ON "organs" USING btree ("cnpj");--> statement-breakpoint
CREATE INDEX "stages_process_idx" ON "process_stages" USING btree ("process_id");--> statement-breakpoint
CREATE UNIQUE INDEX "suppliers_cnpj_idx" ON "suppliers" USING btree ("cnpj");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");