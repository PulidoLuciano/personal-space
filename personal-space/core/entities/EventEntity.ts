export interface EventProps {
  id?: number;
  projectId?: number;
  title: string;
  startAt: Date;
  endAt: Date;
  description?: string;
  recurrenceRule?: string; // RFC5545 RRULE
  locationName?: string;
  locationLat?: number;
  locationLon?: number;
  isExternal: boolean;
  externalId?: string;
}

export class EventEntity {
  public readonly id?: number;
  public readonly projectId?: number;
  public readonly title: string;
  public readonly startAt: Date;
  public readonly endAt: Date;
  public readonly description?: string;
  public readonly recurrenceRule?: string;
  public readonly locationName?: string;
  public readonly locationLat?: number;
  public readonly locationLon?: number;
  public readonly isExternal: boolean;
  public readonly externalId?: string;

  constructor(props: EventProps) {
    // Validaciones de Negocio
    if (!props.title || props.title.trim().length === 0) {
      throw new Error("El evento debe tener un título.");
    }

    if (props.endAt <= props.startAt) {
      throw new Error(
        "La fecha de finalización debe ser posterior a la de inicio.",
      );
    }

    this.id = props.id;
    this.projectId = props.projectId;
    this.title = props.title.trim();
    this.startAt = props.startAt;
    this.endAt = props.endAt;
    this.description = props.description?.trim();
    this.recurrenceRule = props.recurrenceRule;
    this.locationName = props.locationName?.trim();
    this.locationLat = props.locationLat;
    this.locationLon = props.locationLon;
    this.isExternal = props.isExternal;
    this.externalId = props.externalId;
  }

  /**
   * Transforma datos crudos de SQLite a la Entidad.
   */
  static fromDatabase(row: any): EventEntity {
    return new EventEntity({
      id: row.id,
      projectId: row.project_id || undefined,
      title: row.title,
      startAt: new Date(row.start_at),
      endAt: new Date(row.end_at),
      description: row.description,
      recurrenceRule: row.recurrence_rule,
      locationName: row.location_name,
      locationLat: row.location_lat,
      locationLon: row.location_lon,
      isExternal: Boolean(row.is_external),
      externalId: row.external_id,
    });
  }

  /**
   * Calcula la duración del evento en milisegundos.
   */
  get durationMs(): number {
    return this.endAt.getTime() - this.startAt.getTime();
  }

  /**
   * Indica si el evento está ocurriendo en este momento.
   */
  get isHappeningNow(): boolean {
    const now = new Date();
    return now >= this.startAt && now <= this.endAt;
  }

  /**
   * Devuelve si el evento es recurrente.
   */
  get isRecurring(): boolean {
    return !!this.recurrenceRule;
  }
}
