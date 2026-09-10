import { Money } from '../../../menu/domain/value-objects/money.vo.js';
import { OrderItem } from './order-item.entity.js';
import { OrderingDomainError } from '../errors/ordering-domain.error.js';
import { OrderStatus, PaymentStatus, OrderType } from '../../../../generated/prisma/client.js';
import { AggregateRoot } from '../../../../shared/domain/aggregate-root.js';
import { OrderReadyEvent } from '../events/order-ready.event.js';

export type OrderProps = {
  id: string;
  customerId: string;
  restaurantId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  orderType: OrderType;

  subtotal: Money;
  deliveryFee: Money;
  taxAmount: Money;
  discountAmount: Money;
  totalAmount: Money;

  restaurantName: string;
  deliveryAddress: Record<string, any> | null;
  specialInstructions: string | null;

  acceptedAt: Date | null;
  preparingAt: Date | null;
  readyAt: Date | null;
  deliveredAt: Date | null;
  cancelledAt: Date | null;

  createdAt: Date;
  updatedAt: Date;

  items: OrderItem[];
};

export class Order extends AggregateRoot {
  private props: OrderProps;

  constructor(props: OrderProps) {
    super();
    this.props = props;
  }

  public static create(params: {
    customerId: string;
    restaurantId: string;
    restaurantName: string;
    orderType: OrderType;
    deliveryFee: Money;
    taxAmount: Money;
    discountAmount?: Money;
    deliveryAddress?: Record<string, any> | null;
    specialInstructions?: string | null;
    items: OrderItem[];
  }): Order {
    if (params.orderType === OrderType.DELIVERY && !params.deliveryAddress) {
      throw new OrderingDomainError('Delivery address is required for delivery orders');
    }

    if (params.items.length === 0) {
      throw new OrderingDomainError('Order must contain at least one item');
    }

    const discountAmount = params.discountAmount ?? Money.fromNumber(0);

    // Calculate subtotal from items
    let subtotal = Money.fromNumber(0);
    for (const item of params.items) {
      subtotal = subtotal.add(item.getTotalPrice());
    }

    const totalAmount = subtotal
      .add(params.taxAmount)
      .add(params.deliveryFee)
      .subtract(discountAmount);

    const now = new Date();
    return new Order({
      id: crypto.randomUUID(),
      customerId: params.customerId,
      restaurantId: params.restaurantId,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      orderType: params.orderType,
      subtotal,
      deliveryFee: params.deliveryFee,
      taxAmount: params.taxAmount,
      discountAmount,
      totalAmount,
      restaurantName: params.restaurantName,
      deliveryAddress: params.deliveryAddress ?? null,
      specialInstructions: params.specialInstructions ?? null,
      acceptedAt: null,
      preparingAt: null,
      readyAt: null,
      deliveredAt: null,
      cancelledAt: null,
      createdAt: now,
      updatedAt: now,
      items: params.items,
    });
  }

  public static rehydrate(props: OrderProps): Order {
    return new Order(props);
  }

  // --- State Transitions ---

  public accept(): void {
    if (this.props.status !== OrderStatus.PENDING) {
      throw new OrderingDomainError(`Cannot accept order from status ${this.props.status}`);
    }
    this.props.status = OrderStatus.ACCEPTED;
    this.props.acceptedAt = new Date();
    this.touch();
  }

  public startPreparing(): void {
    if (this.props.status !== OrderStatus.ACCEPTED) {
      throw new OrderingDomainError(
        `Cannot start preparing order from status ${this.props.status}`,
      );
    }
    this.props.status = OrderStatus.PREPARING;
    this.props.preparingAt = new Date();
    this.touch();
  }

  public markReady(): void {
    if (this.props.status !== OrderStatus.PREPARING) {
      throw new OrderingDomainError(`Cannot mark order ready from status ${this.props.status}`);
    }
    this.props.status = OrderStatus.READY;
    this.props.readyAt = new Date();
    this.touch();

    this.addDomainEvent(
      new OrderReadyEvent(
        this.getId(),
        this.getRestaurantId(),
        this.getOrderType(),
        this.getDeliveryFee().getValue(),
      ),
    );
  }

  public markOutForDelivery(): void {
    if (this.props.orderType !== OrderType.DELIVERY) {
      throw new OrderingDomainError('Cannot mark pickup order as out for delivery');
    }
    if (this.props.status !== OrderStatus.READY) {
      throw new OrderingDomainError(
        `Cannot mark out for delivery from status ${this.props.status}`,
      );
    }
    this.props.status = OrderStatus.OUT_FOR_DELIVERY;
    this.touch();
  }

  public markDelivered(): void {
    if (
      this.props.orderType === OrderType.DELIVERY &&
      this.props.status !== OrderStatus.OUT_FOR_DELIVERY
    ) {
      throw new OrderingDomainError(`Cannot mark delivered from status ${this.props.status}`);
    }
    if (this.props.orderType === OrderType.PICKUP && this.props.status !== OrderStatus.READY) {
      throw new OrderingDomainError(`Cannot mark picked up from status ${this.props.status}`);
    }
    this.props.status = OrderStatus.DELIVERED;
    this.props.deliveredAt = new Date();
    this.touch();
  }

  public cancel(): void {
    const cancelableStatuses: OrderStatus[] = [OrderStatus.PENDING, OrderStatus.ACCEPTED];
    if (!cancelableStatuses.includes(this.props.status)) {
      throw new OrderingDomainError(`Cannot cancel order from status ${this.props.status}`);
    }
    this.props.status = OrderStatus.CANCELLED;
    this.props.cancelledAt = new Date();
    this.touch();
  }

  // --- Payment Transitions ---
  public markPaid(): void {
    if (this.props.paymentStatus === PaymentStatus.PAID) {
      throw new OrderingDomainError('Order is already paid');
    }
    this.props.paymentStatus = PaymentStatus.PAID;
    this.touch();
  }

  public markPaymentFailed(): void {
    this.props.paymentStatus = PaymentStatus.FAILED;
    this.touch();
  }

  public markRefunded(): void {
    if (this.props.paymentStatus !== PaymentStatus.PAID) {
      throw new OrderingDomainError('Cannot refund an unpaid order');
    }
    this.props.paymentStatus = PaymentStatus.REFUNDED;
    this.touch();
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }

  // --- Getters ---
  public getId(): string {
    return this.props.id;
  }
  public getCustomerId(): string {
    return this.props.customerId;
  }
  public getRestaurantId(): string {
    return this.props.restaurantId;
  }
  public getStatus(): OrderStatus {
    return this.props.status;
  }
  public getPaymentStatus(): PaymentStatus {
    return this.props.paymentStatus;
  }
  public getOrderType(): OrderType {
    return this.props.orderType;
  }
  public getSubtotal(): Money {
    return this.props.subtotal;
  }
  public getDeliveryFee(): Money {
    return this.props.deliveryFee;
  }
  public getTaxAmount(): Money {
    return this.props.taxAmount;
  }
  public getDiscountAmount(): Money {
    return this.props.discountAmount;
  }
  public getTotalAmount(): Money {
    return this.props.totalAmount;
  }
  public getRestaurantName(): string {
    return this.props.restaurantName;
  }
  public getDeliveryAddress(): Record<string, any> | null {
    return this.props.deliveryAddress;
  }
  public getSpecialInstructions(): string | null {
    return this.props.specialInstructions;
  }
  public getAcceptedAt(): Date | null {
    return this.props.acceptedAt;
  }
  public getPreparingAt(): Date | null {
    return this.props.preparingAt;
  }
  public getReadyAt(): Date | null {
    return this.props.readyAt;
  }
  public getDeliveredAt(): Date | null {
    return this.props.deliveredAt;
  }
  public getCancelledAt(): Date | null {
    return this.props.cancelledAt;
  }
  public getCreatedAt(): Date {
    return this.props.createdAt;
  }
  public getUpdatedAt(): Date {
    return this.props.updatedAt;
  }
  public getItems(): OrderItem[] {
    return this.props.items;
  }
}
