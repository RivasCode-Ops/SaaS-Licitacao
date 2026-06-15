ALTER TABLE "suppliers" ADD COLUMN "organ_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_organ_id_organs_id_fk" FOREIGN KEY ("organ_id") REFERENCES "public"."organs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "suppliers_organ_idx" ON "suppliers" USING btree ("organ_id");