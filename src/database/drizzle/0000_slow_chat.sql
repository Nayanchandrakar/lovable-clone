CREATE TYPE "public"."role" AS ENUM('USER', 'ASSISTANT');--> statement-breakpoint
CREATE TYPE "public"."result" AS ENUM('RESULT', 'ERROR');--> statement-breakpoint
CREATE TABLE "fragment" (
	"id" text PRIMARY KEY NOT NULL,
	"message_id" text NOT NULL,
	"sandbox_url" text NOT NULL,
	"title" text NOT NULL,
	"files" json NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "fragment_message_id_unique" UNIQUE("message_id")
);
--> statement-breakpoint
CREATE TABLE "message" (
	"id" text PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"role" "role" NOT NULL,
	"type" "result" NOT NULL,
	"project_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "project" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "fragment" ADD CONSTRAINT "fragment_message_id_message_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."message"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;