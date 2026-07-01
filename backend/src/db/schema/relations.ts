import { relations } from "drizzle-orm";
import { users } from "./users.js";
import { projects } from "./projects.js";
import { thumbnails } from "./thumbnails.js";

// user -> project realtion (1 to N)
export const userRelation = relations(users, ({ many }) => ({
  projects: many(projects),
}));

export const projectRelation = relations(projects, ({ one, many }) => ({
  user: one(users, { fields: [projects.userId], references: [users.id] }),
  thumbnails: many(thumbnails),
}));

// project -> thumbnail relation (1 to N)
export const thumbnailRelation = relations(thumbnails, ({ one }) => ({
  project: one(projects, {
    fields: [thumbnails.projectId],
    references: [projects.id],
  }),
}));
