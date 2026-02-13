import { SQLiteDatabase } from "expo-sqlite";
import { BaseRepository } from "./BaseRepository";

export interface Event {
  id: number;
  project_id?: number;
  title: string;
  start_at: string;
  end_at: string;
  description?: string;
  recurrence_rule?: string;
  location_name?: string;
  location_lat?: number;
  location_lon?: number;
  is_external: boolean;
  external_id?: string;
  created_at: string;
  updated_at: string;
}

export class EventRepository extends BaseRepository<Event> {
  constructor(db: SQLiteDatabase) {
    super(db, "events");
  }
}
