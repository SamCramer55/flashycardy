import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

// Cache connections across invocations in serverless/edge environments.
neonConfig.fetchConnectionCache = true;

// Create a Neon SQL client using the DATABASE_URL connection string.
const sql = neon(process.env.DATABASE_URL!);

// Drizzle database instance used by all query helpers.
export const db = drizzle(sql, { schema });

// Re-export tables so query helpers can import from ".."
export * from "./schema";



