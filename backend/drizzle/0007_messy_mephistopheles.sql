CREATE TYPE "public"."thumbnail_aspect_ratio" AS ENUM('16:9', '9:16', '1:1', '4:5', '3:2', '2:3');--> statement-breakpoint
CREATE TYPE "public"."thumbnail_color_palette" AS ENUM('vibrant', 'warm', 'cool', 'pastel', 'dark', 'monochrome');--> statement-breakpoint
CREATE TYPE "public"."thumbnail_composition" AS ENUM('close_up', 'medium_shot', 'wide', 'centered', 'rule_of_thirds');--> statement-breakpoint
CREATE TYPE "public"."thumbnail_lighting" AS ENUM('natural', 'studio', 'cinematic', 'golden_hour', 'neon', 'high_contrast');--> statement-breakpoint
CREATE TYPE "public"."thumbnail_mood" AS ENUM('dramatic', 'exciting', 'professional', 'dark', 'funny', 'luxury', 'energetic');--> statement-breakpoint
CREATE TYPE "public"."platform" AS ENUM('youtube', 'instagram', 'tiktok', 'x', 'facebook', 'linkedin');--> statement-breakpoint
CREATE TYPE "public"."provider" AS ENUM('gemini', 'openai', 'fal', 'replicate');--> statement-breakpoint
CREATE TYPE "public"."thumbnail_style" AS ENUM('realistic', '3d', 'cartoon', 'anime', 'cinematic', 'minimal', 'illustration');--> statement-breakpoint
CREATE TYPE "public"."thumbnail_status" AS ENUM('pending', 'processing', 'completed', 'failed');