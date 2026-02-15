export interface NoteProps {
  id?: number;
  projectId: number;
  title: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

export class NoteEntity {
  public readonly id?: number;
  public readonly projectId: number;
  public readonly title: string;
  public readonly content: string;
  public readonly createdAt?: string;
  public readonly updatedAt?: string;

  constructor(props: NoteProps) {
    if (!props.title || props.title.trim().length === 0) {
      throw new Error("La nota debe tener un título.");
    }

    if (props.title.length > 100) {
      throw new Error(
        "El título de la nota es demasiado largo (máximo 100 caracteres).",
      );
    }

    this.id = props.id;
    this.projectId = props.projectId;
    this.title = props.title.trim();
    this.content = props.content ?? "";
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static fromDatabase(row: any): NoteEntity {
    return new NoteEntity({
      id: row.id,
      projectId: row.project_id,
      title: row.title,
      content: row.content,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  get excerpt(): string {
    const plainText = this.content.replace(/[#*`]/g, "");
    return plainText.length > 50
      ? `${plainText.substring(0, 50)}...`
      : plainText;
  }
}
