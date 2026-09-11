import { MenuDomainError } from '../errors/menu-domain.error.js';
import { Money } from '../value-objects/money.vo.js';

export enum DietaryPreference {
  VEG = 'VEG',
  NON_VEG = 'NON_VEG',
  VEGAN = 'VEGAN',
}

export type MenuItemProps = {
  id: string;
  restaurantId: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  price: Money;
  imageUrl: string | null;
  isAvailable: boolean;
  sortOrder: number;
  dietaryPreference: DietaryPreference;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  modifierGroupIds: string[]; // For managing the many-to-many relationships logically in domain
};

export class MenuItem {
  private readonly id: string;
  private readonly restaurantId: string;
  private categoryId: string | null;
  private name: string;
  private description: string | null;
  private price: Money;
  private imageUrl: string | null;
  private isAvailable: boolean;
  private sortOrder: number;
  private dietaryPreference: DietaryPreference;
  private readonly createdAt: Date;
  private updatedAt: Date;
  private deletedAt: Date | null;
  private modifierGroupIds: string[];

  constructor(props: MenuItemProps) {
    this.id = MenuItem.validateId(props.id);
    this.restaurantId = MenuItem.validateId(props.restaurantId);
    this.categoryId = props.categoryId;
    this.name = MenuItem.validateName(props.name);
    this.description = props.description;
    this.price = props.price;
    this.imageUrl = props.imageUrl;
    this.isAvailable = props.isAvailable;
    this.sortOrder = props.sortOrder;
    this.dietaryPreference = props.dietaryPreference;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.deletedAt = props.deletedAt;
    this.modifierGroupIds = props.modifierGroupIds || [];
  }

  public static create(params: {
    restaurantId: string;
    categoryId?: string | null;
    name: string;
    description: string | null;
    price: Money;
    sortOrder?: number;
    dietaryPreference?: DietaryPreference;
    modifierGroupIds?: string[];
  }): MenuItem {
    const now = new Date();
    return new MenuItem({
      id: crypto.randomUUID(),
      restaurantId: params.restaurantId,
      categoryId: params.categoryId ?? null,
      name: params.name,
      description: params.description,
      price: params.price,
      imageUrl: null,
      isAvailable: true,
      sortOrder: params.sortOrder ?? 0,
      dietaryPreference: params.dietaryPreference ?? DietaryPreference.VEG,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      modifierGroupIds: params.modifierGroupIds ?? [],
    });
  }

  public static rehydrate(props: MenuItemProps): MenuItem {
    return new MenuItem(props);
  }

  // Getters
  public getId(): string {
    return this.id;
  }
  public getRestaurantId(): string {
    return this.restaurantId;
  }
  public getCategoryId(): string | null {
    return this.categoryId;
  }
  public getName(): string {
    return this.name;
  }
  public getDescription(): string | null {
    return this.description;
  }
  public getPrice(): Money {
    return this.price;
  }
  public getImageUrl(): string | null {
    return this.imageUrl;
  }
  public getIsAvailable(): boolean {
    return this.isAvailable;
  }
  public getSortOrder(): number {
    return this.sortOrder;
  }
  public getDietaryPreference(): DietaryPreference {
    return this.dietaryPreference;
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
  public getModifierGroupIds(): string[] {
    return [...this.modifierGroupIds];
  }
  public isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  // Behaviors
  public updateDetails(params: {
    categoryId?: string | null;
    name?: string;
    description?: string | null;
    price?: Money;
    sortOrder?: number;
    dietaryPreference?: DietaryPreference;
  }): void {
    if (this.isDeleted()) throw new MenuDomainError('Cannot update deleted item');

    if (params.categoryId !== undefined) this.categoryId = params.categoryId;
    if (params.name) this.name = MenuItem.validateName(params.name);
    if (params.description !== undefined) this.description = params.description;
    if (params.price) this.price = params.price;
    if (params.sortOrder !== undefined) this.sortOrder = params.sortOrder;
    if (params.dietaryPreference) this.dietaryPreference = params.dietaryPreference;

    this.touch();
  }

  public assignModifierGroups(groupIds: string[]): void {
    if (this.isDeleted()) throw new MenuDomainError('Cannot assign modifiers to deleted item');
    this.modifierGroupIds = [...new Set([...this.modifierGroupIds, ...groupIds])];
    this.touch();
  }

  public removeModifierGroups(groupIds: string[]): void {
    if (this.isDeleted()) throw new MenuDomainError('Cannot update deleted item');
    this.modifierGroupIds = this.modifierGroupIds.filter((id) => !groupIds.includes(id));
    this.touch();
  }

  public updateImage(url: string | null): void {
    if (this.isDeleted()) throw new MenuDomainError('Cannot update deleted item');
    this.imageUrl = url;
    this.touch();
  }

  public makeAvailable(): void {
    if (this.isDeleted()) throw new MenuDomainError('Cannot activate deleted item');
    this.isAvailable = true;
    this.touch();
  }

  public makeUnavailable(): void {
    if (this.isDeleted()) throw new MenuDomainError('Cannot deactivate deleted item');
    this.isAvailable = false;
    this.touch();
  }

  public delete(): void {
    if (this.isDeleted()) return;
    this.deletedAt = new Date();
    this.isAvailable = false;
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
