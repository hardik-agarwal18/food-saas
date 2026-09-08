import { Money } from '../../../menu/domain/value-objects/money.vo.js';
import { OrderItemModifier } from './order-item-modifier.entity.js';
import { OrderingDomainError } from '../errors/ordering-domain.error.js';

export type OrderItemProps = {
  id: string;
  orderId: string;
  menuItemId: string;
  name: string;
  unitPrice: Money;
  quantity: number;
  specialInstructions: string | null;
  modifiers: OrderItemModifier[];
};

export class OrderItem {
  private readonly id: string;
  private readonly orderId: string;
  private readonly menuItemId: string;
  private readonly name: string;
  private readonly unitPrice: Money;
  private readonly quantity: number;
  private readonly specialInstructions: string | null;
  private readonly modifiers: OrderItemModifier[];

  constructor(props: OrderItemProps) {
    if (props.quantity <= 0) {
      throw new OrderingDomainError('Quantity must be greater than 0');
    }
    this.id = props.id;
    this.orderId = props.orderId;
    this.menuItemId = props.menuItemId;
    this.name = props.name;
    this.unitPrice = props.unitPrice;
    this.quantity = props.quantity;
    this.specialInstructions = props.specialInstructions;
    this.modifiers = props.modifiers;
  }

  public static create(params: {
    orderId: string;
    menuItemId: string;
    name: string;
    unitPrice: Money;
    quantity: number;
    specialInstructions?: string | null;
    modifiers: OrderItemModifier[];
  }): OrderItem {
    return new OrderItem({
      id: crypto.randomUUID(),
      orderId: params.orderId,
      menuItemId: params.menuItemId,
      name: params.name,
      unitPrice: params.unitPrice,
      quantity: params.quantity,
      specialInstructions: params.specialInstructions ?? null,
      modifiers: params.modifiers,
    });
  }

  public static rehydrate(props: OrderItemProps): OrderItem {
    return new OrderItem(props);
  }

  public getTotalPrice(): Money {
    let total = this.unitPrice;
    for (const modifier of this.modifiers) {
      total = total.add(modifier.getPrice());
    }
    return total.multiply(this.quantity);
  }

  public getId(): string {
    return this.id;
  }
  public getOrderId(): string {
    return this.orderId;
  }
  public getMenuItemId(): string {
    return this.menuItemId;
  }
  public getName(): string {
    return this.name;
  }
  public getUnitPrice(): Money {
    return this.unitPrice;
  }
  public getQuantity(): number {
    return this.quantity;
  }
  public getSpecialInstructions(): string | null {
    return this.specialInstructions;
  }
  public getModifiers(): OrderItemModifier[] {
    return this.modifiers;
  }
}
