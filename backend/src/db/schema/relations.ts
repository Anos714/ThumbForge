import { relations } from "drizzle-orm";
import { users } from "./users.js";
import { projects } from "./projects.js";

export const userRelation = relations(users, ({ many }) => ({
  projects: many(projects),
}));

export const projectRelation = relations(projects, ({ one }) => ({
  user: one(users, { fields: [projects.userId], references: [users.id] }),
}));
