import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// For use in Next.js server code (route handlers, server actions, etc.)
export const db = drizzle(process.env.DATABASE_URL!, { schema });
export * from './schema';


