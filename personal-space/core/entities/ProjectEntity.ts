export class ProjectEntity {
  public readonly id?: number;
  public readonly name: string;
  public readonly color: string;
  public readonly icon?: string;

  constructor(props: {
    id?: number;
    name: string;
    color?: string;
    icon?: string;
  }) {
    if (!props.name || props.name.trim().length < 3) {
      throw new Error(
        "El nombre del proyecto debe tener al menos 3 caracteres.",
      );
    }

    this.id = props.id;
    this.name = props.name.trim();
    this.color = props.color || "#3498db";
    this.icon = props.icon;
  }

  // Método para convertir de la base de datos a la entidad
  static fromDatabase(row: any): ProjectEntity {
    return new ProjectEntity({
      id: row.id,
      name: row.name,
      color: row.color,
      icon: row.icon,
    });
  }
}
