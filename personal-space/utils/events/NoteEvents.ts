import { EventEmitter } from "eventemitter3";

export interface NoteEventData {
  projectId?: number;
  noteId?: number;
}

export const noteEvents = new EventEmitter<{
  noteCreated: [NoteEventData];
  noteUpdated: [NoteEventData];
  noteDeleted: [NoteEventData];
}>();
