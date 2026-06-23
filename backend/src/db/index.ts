import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema/index.js';
import { env } from '../validators/env.validator.js';

const sql = neon(env.DATABASE_URL);
export const db = drizzle({ client: sql,schema });
