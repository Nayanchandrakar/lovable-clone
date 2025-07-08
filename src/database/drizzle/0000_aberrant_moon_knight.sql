CREATE TYPE "public"."role" AS ENUM('USER', 'ASSISTANT');--> statement-breakpoint
CREATE TYPE "public"."result" AS ENUM('RESULT', 'ERROR');--> statement-breakpoint
CREATE TABLE "fragment" (
	"id" text PRIMARY KEY NOT NULL,
	"messageId" text,
	"sandboxUrl" text,
	"title" text,
	"files" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "fragment_messageId_unique" UNIQUE("messageId")
);
--> statement-breakpoint
CREATE TABLE "message" (
	"id" text PRIMARY KEY NOT NULL,
	"content" text,
	"role" "role",
	"type" "result",
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "fragment" ADD CONSTRAINT "fragment_messageId_message_id_fk" FOREIGN KEY ("messageId") REFERENCES "public"."message"("id") ON DELETE cascade ON UPDATE no action;