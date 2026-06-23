import { sql } from "drizzle-orm";
import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const authProviderEnum = pgEnum("auth_provider", ["local", "google"]);

export const users = pgTable("users", {
  id: uuid("id")
    .primaryKey()
    .default(sql`uuidv7()`),
  fullName: varchar("full_name", { length: 150 }).notNull(),
  email: varchar("email", { length: 200 }).notNull().unique(),
  avatarUrl: text("avatar_url"),
  passwordHash: text("password_hash"),
  googleId: text("google_id").unique(),
  authProvider: authProviderEnum("auth_provider").default("local").notNull(),
  role: roleEnum("role").default("user").notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  emailVerifiedAt: timestamp("email_verified_at"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
});
