import { MenuDomainError } from '../errors/menu-domain.error.js';
import { Money } from '../value-objects/money.vo.js';

export type MenuModifierItemProps = {
  id: string;
  modifierGroupId: string;
  name: string;
  priceAdjustment: Money;
  isAvailable: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export class MenuModifierItem {
  private readonly id: string;
  private readonly modifierGroupId: string;
  private name: string;
  private priceAdjustment: Money;
  private isAvailable: boolean;
  private sortOrder: number;
  private readonly createdAt: Date;
  private updatedAt: Date;
  private deletedAt: Date | null;

  constructor(props: MenuModifierItemProps) {
    this.id = MenuModifierItem.validateId(props.id);
    this.modifierGroupId = MenuModifierItem.validateId(props.modifierGroupId);
    this.name = MenuModifierItem.validateName(props.name);
    this.priceAdjustment = props.priceAdjustment;
    this.isAvailable = props.isAvailable;
    this.sortOrder = props.sortOrder;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.deletedAt = props.deletedAt;
  }

  public static create(params: {
    modifierGroupId: string;
    name: string;
    priceAdjustment: Money;
    sortOrder?: number;
  }): MenuModifierItem {
    const now = new Date();
    return new MenuModifierItem({
      id: crypto.randomUUID(),
      modifierGroupId: params.modifierGroupId,
      name: params.name,
      priceAdjustment: params.priceAdjustment,
      isAvailable: true,
      sortOrder: params.sortOrder ?? 0,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
  }

  public static rehydrate(props: MenuModifierItemProps): MenuModifierItem {
    return new MenuModifierItem(props);
  }

  // Getters
  public getId(): string {
    return this.id;
  }
  public getModifierGroupId(): string {
    return this.modifierGroupId;
  }
  public getName(): string {
    return this.name;
  }
  public getPriceAdjustment(): Money {
    return this.priceAdjustment;
  }
  public getIsAvailable(): boolean {
    return this.isAvailable;
  }
  public getSortOrder(): number {
    return this.sortOrder;
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
    priceAdjustment?: Money;
    sortOrder?: number;
  }): void {
    if (this.isDeleted()) throw new MenuDomainError('Cannot update deleted modifier item');

    if (params.name) this.name = MenuModifierItem.validateName(params.name);
    if (params.priceAdjustment) this.priceAdjustment = params.priceAdjustment;
    if (params.sortOrder !== undefined) this.sortOrder = params.sortOrder;

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
