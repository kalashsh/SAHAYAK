CREATE TABLE "districts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"state" text NOT NULL,
	"region" text NOT NULL,
	"potential" integer NOT NULL,
	"recorded" integer NOT NULL,
	"gap" integer NOT NULL,
	"priority" integer NOT NULL,
	"status" text NOT NULL,
	"freshness" text NOT NULL,
	"signal" text NOT NULL,
	"locality" text NOT NULL,
	"households" integer NOT NULL,
	"scheme" text NOT NULL,
	"verification" text NOT NULL,
	"x" integer NOT NULL,
	"y" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schemes" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"short" text NOT NULL,
	"tone" text NOT NULL,
	"households" integer NOT NULL,
	"record" text NOT NULL,
	"rule" text NOT NULL,
	"description" text NOT NULL,
	"beneficiaries" text NOT NULL,
	"availability" text NOT NULL,
	"occupation" text NOT NULL,
	"benefit" text NOT NULL,
	"official_source" text NOT NULL,
	"updated" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"password_hash" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "districts_name_unique" ON "districts" USING btree ("name");--> statement-breakpoint
CREATE INDEX "districts_state_idx" ON "districts" USING btree ("state");--> statement-breakpoint
CREATE INDEX "districts_region_idx" ON "districts" USING btree ("region");--> statement-breakpoint
CREATE INDEX "districts_scheme_idx" ON "districts" USING btree ("scheme");--> statement-breakpoint
CREATE INDEX "schemes_category_idx" ON "schemes" USING btree ("category");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");