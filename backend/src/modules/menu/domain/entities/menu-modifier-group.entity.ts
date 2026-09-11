import { MenuDomainError } from '../errors/menu-domain.error.js';

export type MenuModifierGroupProps = {
  id: string;
  restaurantId: string;
  name: string;
  description: string | null;
  isRequired: boolean;
  minSelections: number;
  maxSelections: number | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export class MenuModifierGroup {
  private readonly id: string;
  private readonly restaurantId: string;
  private name: string;
  private description: string | null;
  private isRequired: boolean;
  private minSelections: number;
  private maxSelections: number | null;
  private readonly createdAt: Date;
  private updatedAt: Date;
  private deletedAt: Date | null;

  constructor(props: MenuModifierGroupProps) {
    this.id = MenuModifierGroup.validateId(props.id);
    this.restaurantId = MenuModifierGroup.validateId(props.restaurantId);
    this.name = MenuModifierGroup.validateName(props.name);
    this.description = props.description;
    this.isRequired = props.isRequired;

    if (props.minSelections < 0) throw new MenuDomainError('minSelections cannot be negative');
    if (props.maxSelections !== null && props.maxSelections < props.minSelections) {
      throw new MenuDomainError('maxSelections cannot be less than minSelections');
    }

    this.minSelections = props.minSelections;
    this.maxSelections = props.maxSelections;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.deletedAt = props.deletedAt;
  }

  public static create(params: {
    restaurantId: string;
    name: string;
    description: string | null;
    isRequired: boolean;
    minSelections: number;
    maxSelections: number | null;
  }): MenuModifierGroup {
    const now = new Date();
    return new MenuModifierGroup({
      id: crypto.randomUUID(),
      restaurantId: params.restaurantId,
      name: params.name,
      description: params.description,
      isRequired: params.isRequired,
      minSelections: params.minSelections,
      maxSelections: params.maxSelections,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
  }

  public static rehydrate(props: MenuModifierGroupProps): MenuModifierGroup {
    return new MenuModifierGroup(props);
  }

  // Getters
  public getId(): string {
    return this.id;
  }
  public getRestaurantId(): string {
    return this.restaurantId;
  }
  public getName(): string {
    return this.name;
  }
  public getDescription(): string | null {
    return this.description;
  }
  public getIsRequired(): boolean {
    return this.isRequired;
  }
  public getMinSelections(): number {
    return this.minSelections;
  }
  public getMaxSelections(): number | null {
    return this.maxSelections;
  }
  public getCreatedAt(): Date {
    return this.createdAt;
  }
  public getUpdatedAt(): Date {
    return this.updatedAt;
  }
  public getDeletedAt(): Date | null {
    return this.deletedAt;
  }
  public isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  // Behaviors
  public updateDetails(params: {
    name?: string;
    description?: string | null;
    isRequired?: boolean;
    minSelections?: number;
    maxSelections?: number | null;
  }): void {
    if (this.isDeleted()) throw new MenuDomainError('Cannot update deleted modifier group');

    if (params.name) this.name = MenuModifierGroup.validateName(params.name);
    if (params.description !== undefined) this.description = params.description;

    if (params.isRequired !== undefined) this.isRequired = params.isRequired;

    const newMin = params.minSelections !== undefined ? params.minSelections : this.minSelections;
    const newMax = params.maxSelections !== undefined ? params.maxSelections : this.maxSelections;

    if (newMin < 0) throw new MenuDomainError('minSelections cannot be negative');
    if (newMax !== null && newMax < newMin) {
      throw new MenuDomainError('maxSelections cannot be less than minSelections');
    }

    this.minSelections = newMin;
    this.maxSelections = newMax;

    this.touch();
  }

  public delete(): void {
    if (this.isDeleted()) return;
    this.deletedAt = new Date();
    this.touch();
  }

  private touch(): void {
    this.updatedAt = new Date();
  }

  private static validateId(id: string): string {
    if (!id || id.trim().length === 0) throw new MenuDomainError('Invalid ID');
    return id.trim();
  }

  private static validateName(name: string): string {
    if (!name || name.trim().length === 0) throw new MenuDomainError('Name cannot be empty');
    return name.trim();
  }
}
