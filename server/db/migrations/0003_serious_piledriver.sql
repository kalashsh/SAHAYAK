CREATE TABLE "citizen_saved_schemes" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"scheme_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "citizen_saved_schemes_session_scheme_unique" ON "citizen_saved_schemes" USING btree ("session_id","scheme_id");--> statement-breakpoint
CREATE INDEX "citizen_saved_schemes_session_idx" ON "citizen_saved_schemes" USING btree ("session_id");