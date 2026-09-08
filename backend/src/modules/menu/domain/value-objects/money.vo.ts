import { MenuDomainError } from '../errors/menu-domain.error.js';

export class Money {
  private constructor(private readonly amount: number) {
    if (amount < 0) {
      throw new MenuDomainError('Money amount cannot be negative');
    }
    // ensure max 2 decimal places for generic representation if necessary, or store as integer cents
    // for this SaaS, keeping it as decimal number is okay, but let's enforce some rounding
    this.amount = Math.round(amount * 100) / 100;
  }

  public static fromNumber(amount: number): Money {
    return new Money(amount);
  }

  public getValue(): number {
    return this.amount;
  }

  public equals(other: Money): boolean {
    return this.amount === other.getValue();
  }

  public add(other: Money): Money {
    return Money.fromNumber(this.amount + other.getValue());
  }

  public subtract(other: Money): Money {
    const newAmount = this.amount - other.getValue();
    if (newAmount < 0) {
      throw new MenuDomainError('Money amount cannot be negative');
    }
    return Money.fromNumber(newAmount);
  }

  public multiply(multiplier: number): Money {
    return Money.fromNumber(this.amount * multiplier);
  }
}
