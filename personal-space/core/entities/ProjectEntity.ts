export interface ProjectProps {
  id?: number;
  name: string;
  color?: string;
  icon?: string;
  createdAt?: string;
  updatedAt?: string;
}

export class ProjectEntity {
  public readonly id?: number;
  public readonly name: string;
  public readonly color: string;
  public readonly icon?: string;
  public readonly createdAt?: string;
  public readonly updatedAt?: string;

  constructor(props: ProjectProps) {
    if (!props.name || props.name.trim().length < 3) {
      throw new Error(
        "El nombre del proyecto debe tener al menos 3 caracteres.",
      );
    }

    this.id = props.id;
    this.name = props.name.trim();
    this.color = props.color || "#3498db";
    this.icon = props.icon;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static fromDatabase(row: any): ProjectEntity {
    return new ProjectEntity({
      id: row.id,
      name: row.name,
      color: row.color,
      icon: row.icon,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }
}
