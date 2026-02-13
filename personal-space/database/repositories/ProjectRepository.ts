import { SQLiteDatabase } from "expo-sqlite";
import { BaseRepository } from "./BaseRepository";

export interface Project {
  id: number;
  name: string;
  color: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}

export class ProjectRepository extends BaseRepository<Project> {
  constructor(db: SQLiteDatabase) {
    super(db, "projects");
  }
}
