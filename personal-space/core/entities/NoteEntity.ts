export interface NoteProps {
  id?: number;
  projectId: number;
  title: string;
  content: string; // Markdown
}

export class NoteEntity {
  public readonly id?: number;
  public readonly projectId: number;
  public readonly title: string;
  public readonly content: string;

  constructor(props: NoteProps) {
    // Validaciones de Negocio
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
  }

  /**
   * Mapper para transformar los datos crudos de SQLite a la Entidad.
   * SQLite devuelve fechas como strings (ISO), aquí las convertimos a objetos Date.
   */
  static fromDatabase(row: any): NoteEntity {
    return new NoteEntity({
      id: row.id,
      projectId: row.project_id,
      title: row.title,
      content: row.content,
    });
  }

  /**
   * Método de utilidad para obtener una vista previa corta del contenido.
   * Útil para los listados de la UI.
   */
  get excerpt(): string {
    const plainText = this.content.replace(/[#*`]/g, ""); // Limpieza básica de Markdown
    return plainText.length > 50
      ? `${plainText.substring(0, 50)}...`
      : plainText;
  }
}
