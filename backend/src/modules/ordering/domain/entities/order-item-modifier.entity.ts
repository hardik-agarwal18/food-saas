import { Money } from '../../../menu/domain/value-objects/money.vo.js';

export type OrderItemModifierProps = {
  id: string;
  orderItemId: string;
  menuModifierItemId: string;
  name: string;
  price: Money;
};

export class OrderItemModifier {
  private readonly id: string;
  private readonly orderItemId: string;
  private readonly menuModifierItemId: string;
  private readonly name: string;
  private readonly price: Money;

  constructor(props: OrderItemModifierProps) {
    this.id = props.id;
    this.orderItemId = props.orderItemId;
    this.menuModifierItemId = props.menuModifierItemId;
    this.name = props.name;
    this.price = props.price;
  }

  public static create(params: {
    orderItemId: string;
    menuModifierItemId: string;
    name: string;
    price: Money;
  }): OrderItemModifier {
    return new OrderItemModifier({
      id: crypto.randomUUID(),
      orderItemId: params.orderItemId,
      menuModifierItemId: params.menuModifierItemId,
      name: params.name,
      price: params.price,
    });
  }

  public static rehydrate(props: OrderItemModifierProps): OrderItemModifier {
    return new OrderItemModifier(props);
  }

  public getId(): string {
    return this.id;
  }
  public getOrderItemId(): string {
    return this.orderItemId;
  }
  public getMenuModifierItemId(): string {
    return this.menuModifierItemId;
  }
  public getName(): string {
    return this.name;
  }
  public getPrice(): Money {
    return this.price;
  }
}
