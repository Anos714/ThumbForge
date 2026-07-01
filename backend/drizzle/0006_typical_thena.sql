CREATE TABLE "thumbnails" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"project_id" uuid NOT NULL,
	"prompt" text NOT NULL,
	"improved_prompt" text,
	"provider" "provider" DEFAULT 'gemini' NOT NULL,
	"platform" "platform",
	"style" "thumbnail_style",
	"mood" "thumbnail_mood",
	"lighting" "thumbnail_lighting",
	"color_palette" "thumbnail_color_palette",
	"composition" "thumbnail_composition",
	"reference_assets" jsonb,
	"generated_image_url" text,
	"generated_image_public_id" text,
	"aspect_ratio" "thumbnail_aspect_ratio" DEFAULT '16:9' NOT NULL,
	"generation_metadata" jsonb,
	"status" "thumbnail_status" DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "thumbnails" ADD CONSTRAINT "thumbnails_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;