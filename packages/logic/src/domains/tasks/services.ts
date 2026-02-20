import { eq } from "drizzle-orm";
import {
  PersonalSpaceDB,
  tasks,
  insertTaskSchema,
} from "@personal-space/db";

export async function createTask(db: PersonalSpaceDB, payload: unknown) {
  const data = insertTaskSchema.parse(payload);
  const [row] = await db.insert(tasks).values(data).returning();
  return row;
}

export async function getTasksByProject(db: PersonalSpaceDB, projectId: number) {
  return await db.select().from(tasks).where(eq(tasks.projectId, projectId));
}
