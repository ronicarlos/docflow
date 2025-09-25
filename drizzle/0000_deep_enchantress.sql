CREATE TYPE "public"."contract_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TABLE "contracts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"internal_code" text NOT NULL,
	"client" text NOT NULL,
	"scope" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"status" "contract_status" DEFAULT 'active' NOT NULL,
	"responsible_user_id" uuid,
	"common_risks" jsonb DEFAULT '[]'::jsonb,
	"alert_keywords" jsonb DEFAULT '[]'::jsonb,
	"analysis_document_type_ids" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
