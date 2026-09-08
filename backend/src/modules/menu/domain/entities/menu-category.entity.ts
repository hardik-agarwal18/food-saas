import { MenuDomainError } from '../errors/menu-domain.error.js';

export type MenuCategoryProps = {
  id: string;
  restaurantId: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export class MenuCategory {
  private readonly id: string;
  private readonly restaurantId: string;
  private name: string;
  private description: string | null;
  private sortOrder: number;
  private isActive: boolean;
  private readonly createdAt: Date;
  private updatedAt: Date;
  private deletedAt: Date | null;

  constructor(props: MenuCategoryProps) {
    this.id = MenuCategory.validateId(props.id);
    this.restaurantId = MenuCategory.validateId(props.restaurantId);
    this.name = MenuCategory.validateName(props.name);
    this.description = props.description;
    this.sortOrder = props.sortOrder;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.deletedAt = props.deletedAt;
  }

  public static create(params: {
    restaurantId: string;
    name: string;
    description: string | null;
    sortOrder?: number;
  }): MenuCategory {
    const now = new Date();
    return new MenuCategory({
      id: crypto.randomUUID(),
      restaurantId: params.restaurantId,
      name: params.name,
      description: params.description,
      sortOrder: params.sortOrder ?? 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
  }

  public static rehydrate(props: MenuCategoryProps): MenuCategory {
    return new MenuCategory(props);
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
  public getSortOrder(): number {
    return this.sortOrder;
  }
  public getIsActive(): boolean {
    return this.isActive;
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
  public updateProfile(params: {
    name?: string;
    description?: string | null;
    sortOrder?: number;
  }): void {
    if (this.isDeleted()) throw new MenuDomainError('Cannot update deleted category');

    if (params.name) this.name = MenuCategory.validateName(params.name);
    if (params.description !== undefined) this.description = params.description;
    if (params.sortOrder !== undefined) this.sortOrder = params.sortOrder;

    this.touch();
  }

  public activate(): void {
    if (this.isDeleted()) throw new MenuDomainError('Cannot activate deleted category');
    this.isActive = true;
    this.touch();
  }

  public deactivate(): void {
    if (this.isDeleted()) throw new MenuDomainError('Cannot deactivate deleted category');
    this.isActive = false;
    this.touch();
  }

  public delete(): void {
    if (this.isDeleted()) return;
    this.deletedAt = new Date();
    this.isActive = false;
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
