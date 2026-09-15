import { AggregateRoot } from '../../../../shared/domain/aggregate-root.js';
import { PaymentProvider, PaymentAttemptStatus } from '../types/payment.types.js';

export type PaymentAttemptProps = {
  id: string;
  orderId: string;
  provider: PaymentProvider;
  providerPaymentId: string;
  amount: number;
  currency: string;
  status: PaymentAttemptStatus;
  failureCode: string | null;
  failureReason: string | null;
  metadata: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
};

export class PaymentAttempt extends AggregateRoot {
  private props: PaymentAttemptProps;

  constructor(props: PaymentAttemptProps) {
    super();
    this.props = props;
  }

  public static create(params: {
    orderId: string;
    provider: PaymentProvider;
    providerPaymentId: string;
    amount: number;
    currency?: string;
    metadata?: Record<string, any>;
  }): PaymentAttempt {
    const now = new Date();
    const props: PaymentAttemptProps = {
      id: crypto.randomUUID(),
      orderId: params.orderId,
      provider: params.provider,
      providerPaymentId: params.providerPaymentId,
      amount: params.amount,
      currency: params.currency ?? 'USD',
      status: PaymentAttemptStatus.PENDING,
      failureCode: null,
      failureReason: null,
      metadata: params.metadata ?? null,
      createdAt: now,
      updatedAt: now,
    };
    return new PaymentAttempt(props);
  }

  public static rehydrate(props: PaymentAttemptProps): PaymentAttempt {
    return new PaymentAttempt(props);
  }

  public markPaid(): void {
    if (this.props.status !== PaymentAttemptStatus.PENDING) {
      throw new Error(`Cannot mark paid from status ${this.props.status}`);
    }
    this.props.status = PaymentAttemptStatus.PAID;
    this.touch();
  }

  public markFailed(failureCode?: string, failureReason?: string): void {
    if (this.props.status !== PaymentAttemptStatus.PENDING) {
      throw new Error(`Cannot mark failed from status ${this.props.status}`);
    }
    this.props.status = PaymentAttemptStatus.FAILED;
    if (failureCode) this.props.failureCode = failureCode;
    if (failureReason) this.props.failureReason = failureReason;
    this.touch();
  }

  public markRefunded(): void {
    if (this.props.status !== PaymentAttemptStatus.PAID) {
      throw new Error(`Cannot mark refunded from status ${this.props.status}`);
    }
    this.props.status = PaymentAttemptStatus.REFUNDED;
    this.touch();
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }

  public getId(): string {
    return this.props.id;
  }

  public getOrderId(): string {
    return this.props.orderId;
  }

  public getProvider(): PaymentProvider {
    return this.props.provider;
  }

  public getProviderPaymentId(): string {
    return this.props.providerPaymentId;
  }

  public getAmount(): number {
    return this.props.amount;
  }

  public getCurrency(): string {
    return this.props.currency;
  }

  public getStatus(): PaymentAttemptStatus {
    return this.props.status;
  }

  public getFailureCode(): string | null {
    return this.props.failureCode;
  }

  public getFailureReason(): string | null {
    return this.props.failureReason;
  }

  public getMetadata(): Record<string, any> | null {
    return this.props.metadata;
  }

  public getCreatedAt(): Date {
    return this.props.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.props.updatedAt;
  }
}
