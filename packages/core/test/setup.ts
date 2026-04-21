import { createDatabase } from '../src/database/index.js';
import type { DBClient } from '../src/database/index.js';
import { createInMemoryDB } from './db-client.js';

export async function createTestDatabase(): Promise<DBClient> {
  const db = createInMemoryDB();
  await createDatabase(db);
  return db;
}