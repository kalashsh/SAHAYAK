CREATE TABLE "verification_actions" (
	"id" serial PRIMARY KEY NOT NULL,
	"case_id" text NOT NULL,
	"actor_id" integer,
	"action" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification_cases" (
	"id" text PRIMARY KEY NOT NULL,
	"location" text NOT NULL,
	"scheme" text NOT NULL,
	"score" integer NOT NULL,
	"confidence" text NOT NULL,
	"status" text NOT NULL,
	"signal" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "verification_actions" ADD CONSTRAINT "verification_actions_case_id_verification_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."verification_cases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_actions" ADD CONSTRAINT "verification_actions_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "verification_actions_case_idx" ON "verification_actions" USING btree ("case_id");--> statement-breakpoint
CREATE INDEX "verification_cases_status_idx" ON "verification_cases" USING btree ("status");