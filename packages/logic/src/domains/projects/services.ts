import { eq } from "drizzle-orm";
import {
  PersonalSpaceDB,
  projects,
  insertProjectSchema,
} from "@personal-space/db";

export async function createProject(db: PersonalSpaceDB, payload: unknown) {
  const data = insertProjectSchema.parse(payload);
  const [row] = await db.insert(projects).values(data).returning();
  return row;
}

export async function getProjects(db: PersonalSpaceDB) {
  return await db.select().from(projects);
}

export async function updateProject(db: PersonalSpaceDB, id: number, payload: unknown) {
  const data = insertProjectSchema.partial().parse(payload);
  const [row] = await db.update(projects).set(data).where(eq(projects.id, id)).returning();
  return row;
}

export async function deleteProject(db: PersonalSpaceDB, id: number) {
  await db.delete(projects).where(eq(projects.id, id));
}
