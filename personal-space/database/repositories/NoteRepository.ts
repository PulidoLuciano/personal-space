import { SQLiteDatabase } from "expo-sqlite";
import { BaseRepository } from "./BaseRepository";

export interface Note {
  id: number;
  project_id: number;
  title: string;
  content?: string;
  created_at: string;
  updated_at: string;
}

export class NoteRepository extends BaseRepository<Note> {
  constructor(db: SQLiteDatabase) {
    super(db, "notes");
  }
}
