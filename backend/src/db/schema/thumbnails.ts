import {
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { projects } from "./projects.js";
import { sql } from "drizzle-orm";

export const providerEnum = pgEnum("provider", [
  "gemini",
  "openai",
  "fal",
  "replicate",
]);

export const platformEnum = pgEnum("platform", [
  "youtube",
  "instagram",
  "tiktok",
  "x",
  "facebook",
  "linkedin",
]);

export const thumbnailStatusEnum = pgEnum("thumbnail_status", [
  "pending",
  "processing",
  "completed",
  "failed",
]);

export const styleEnum = pgEnum("thumbnail_style", [
  "realistic",
  "3d",
  "cartoon",
  "anime",
  "cinematic",
  "minimal",
  "illustration",
]);

export const moodEnum = pgEnum("thumbnail_mood", [
  "dramatic",
  "exciting",
  "professional",
  "dark",
  "funny",
  "luxury",
  "energetic",
]);

export const lightingEnum = pgEnum("thumbnail_lighting", [
  "natural",
  "studio",
  "cinematic",
  "golden_hour",
  "neon",
  "high_contrast",
]);

export const colorPaletteEnum = pgEnum("thumbnail_color_palette", [
  "vibrant",
  "warm",
  "cool",
  "pastel",
  "dark",
  "monochrome",
]);

export const compositionEnum = pgEnum("thumbnail_composition", [
  "close_up",
  "medium_shot",
  "wide",
  "centered",
  "rule_of_thirds",
]);

export const aspectRatioEnum = pgEnum("thumbnail_aspect_ratio", [
  "16:9",
  "9:16",
  "1:1",
  "4:5",
  "3:2",
  "2:3",
]);

export const thumbnails = pgTable("thumbnails", {
  id: uuid("id")
    .primaryKey()
    .default(sql`uuidv7()`),

  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, {
      onDelete: "cascade",
    }),

  // User Prompt
  prompt: text("prompt").notNull(),

  // AI Enhanced Prompt
  improvedPrompt: text("improved_prompt"),

  // AI Provider
  provider: providerEnum("provider").default("gemini").notNull(),

  // Target Platform
  platform: platformEnum("platform"),

  // Visual Preferences
  style: styleEnum("style"),

  mood: moodEnum("mood"),

  lighting: lightingEnum("lighting"),

  colorPalette: colorPaletteEnum("color_palette"),

  composition: compositionEnum("composition"),

  // User Uploaded Reference Assets
  referenceAssets: jsonb("reference_assets").$type<
    {
      secureUrl: string;
      publicId: string;
    }[]
  >(),

  // Generated Thumbnail
  generatedImageUrl: text("generated_image_url"),

  generatedImagePublicId: text("generated_image_public_id"),

  // aspect ratio of image
  aspectRatio: aspectRatioEnum("aspect_ratio").default("16:9").notNull(),

  // AI Generation Metadata
  generationMetadata: jsonb("generation_metadata").$type<{
    model?: string;
    modelVersion?: string;
    generationTime?: number;
    promptTokens?: number;
    outputTokens?: number;
    creditsUsed?: number;
  }>(),

  // Processing Status
  status: thumbnailStatusEnum("status").default("pending").notNull(),

  errorMessage: text("error_message"),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$defaultFn(() => new Date()),
});
