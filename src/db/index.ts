import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Provide fallback for build time - at runtime, DATABASE_URL should be set in environment variables
export const db = drizzle(process.env.DATABASE_URL || 'postgresql://placeholder', { schema });
