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

  async searchByProject(
    projectId: number,
    searchText: string,
    page: number,
    pageSize: number
  ): Promise<{ notes: Note[]; total: number }> {
    const offset = (page - 1) * pageSize;
    
    const countQuery = `
      SELECT COUNT(*) as count 
      FROM ${this.tableName} 
      WHERE project_id = ? 
      AND (title LIKE ? OR content LIKE ?)
    `;
    const searchTerm = `%${searchText}%`;
    const countResult = await this.db.getFirstAsync<{ count: number }>(
      countQuery,
      [projectId, searchTerm, searchTerm]
    );
    const total = countResult?.count || 0;

    const query = `
      SELECT * FROM ${this.tableName} 
      WHERE project_id = ? 
      AND (title LIKE ? OR content LIKE ?)
      ORDER BY updated_at DESC
      LIMIT ? OFFSET ?
    `;
    const notes = await this.db.getAllAsync<Note>(
      query,
      [projectId, searchTerm, searchTerm, pageSize, offset]
    );

    return { notes, total };
  }
}
