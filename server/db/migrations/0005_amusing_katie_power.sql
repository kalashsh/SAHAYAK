ALTER TABLE "verification_actions" ADD COLUMN "previous_status" text NOT NULL;--> statement-breakpoint
ALTER TABLE "verification_actions" ADD COLUMN "next_status" text NOT NULL;