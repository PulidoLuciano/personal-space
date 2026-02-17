import { Validator } from './Validator';
import { ValidationError } from './errors/ValidationError';

export class Project {
  private _title!: string;
  private _icon!: string;
  private _color!: string;

  constructor(title: string, icon: string = 'circle', color: string = '#808080') {
    Validator.validateAll(
      () => this.validateTitle(title),
      () => this.validateIcon(icon),
      () => this.validateColor(color)
    );
    this._title = title;
    this._icon = icon;
    this._color = color;
  }

  get title(): string {
    return this._title;
  }

  set title(value: string) {
    this.validateTitle(value);
    this._title = value;
  }

  get icon(): string {
    return this._icon;
  }

  set icon(value: string) {
    this.validateIcon(value);
    this._icon = value;
  }

  get color(): string {
    return this._color;
  }

  set color(value: string) {
    this.validateColor(value);
    this._color = value;
  }

  private validateTitle(value: string): void {
    Validator.notBlank(value, 'Title');
  }

  private validateIcon(value: string): void {
    Validator.notBlank(value, 'Icon');
  }

  private validateColor(value: string): void {
    Validator.notBlank(value, 'Color');
  }
}
