import {z} from 'zod';
import 'dotenv/config'

export const envSchema=z.object({
    DATABASE_URL:z.string(),
    PORT:z.string().default("8000"),
    NODE_ENV:z.enum(['development','production']).default('development'),
    ACCESS_SECRET:z.string(),
    REFRESH_SECRET:z.string(),
    FRONTEND_URL:z.string(),
    REDIS_URL:z.string(),
    SMTP_HOST:z.string(),
    SMTP_PORT:z.string().default("587"),
    SMTP_USER:z.string(),
    SMTP_PASS:z.string(),
    SMTP_FROM:z.string(),
});

const envParse=envSchema.safeParse(process.env);
if (!envParse.success) {
  console.error("ERROR: Invalid Environment Variables");
  const errorMsg=JSON.stringify(envParse.error.flatten().fieldErrors,null,2)
  console.error(errorMsg);
  process.exit(1);
}

export const env=envParse.data;