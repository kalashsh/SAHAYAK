CREATE TABLE "citizen_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"state" text NOT NULL,
	"district" text NOT NULL,
	"locality" text NOT NULL,
	"age_group" text NOT NULL,
	"occupation" text NOT NULL,
	"employment" text NOT NULL,
	"education" text NOT NULL,
	"household_size" text NOT NULL,
	"income" text NOT NULL,
	"housing" text NOT NULL,
	"dependents" text NOT NULL,
	"situation" text NOT NULL,
	"landholding" text NOT NULL,
	"disability" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "citizen_profiles_session_unique" ON "citizen_profiles" USING btree ("session_id");