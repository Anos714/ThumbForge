import { sql } from "drizzle-orm";
import { pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";



const roleEnum=pgEnum('role',['user','admin']);


export const users=pgTable('users',{
    id:uuid('id').primaryKey().default(sql`uuidv7()`),
    fullName:varchar('full_name',{length:150}).notNull(),
    email:varchar('email',{length:200}).notNull().unique(),
    avatarUrl:text('avatar_url'),
    passwordHash:text('password_hash'),
    googleId:text('google_id').unique(),
    githubId:text('github_id').unique(),
    role:roleEnum().default('user').notNull(),

    createdAt:timestamp('created_at',{withTimezone:true}).defaultNow().notNull(),
    updatedAt:timestamp('updated_at',{withTimezone:true}).defaultNow().notNull().$onUpdateFn(()=>new Date()) 

})