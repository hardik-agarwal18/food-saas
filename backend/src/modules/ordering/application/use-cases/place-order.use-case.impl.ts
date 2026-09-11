import { injectable, inject } from 'tsyringe';
import type { IPlaceOrderUseCase } from './place-order.use-case.js';
import { PlaceOrderDto, OrderResponseDto } from '../dto/order.dto.js';
import { OrderDtoMapper } from '../mappers/order-dto.mapper.js';
import { Order } from '../../domain/entities/order.entity.js';
import { OrderItem } from '../../domain/entities/order-item.entity.js';
import { OrderItemModifier } from '../../domain/entities/order-item-modifier.entity.js';
import { OrderingDomainError } from '../../domain/errors/ordering-domain.error.js';
import { Money } from '../../../menu/domain/value-objects/money.vo.js';

// We need tokens for other modules
import { RestaurantTokens } from '../../../restaurant/infrastructure/persistence/tokens/restaurant.tokens.js';
import type { IRestaurantRepository } from '../../../restaurant/domain/repositories/restaurant.repository.js';

import { MenuTokens } from '../../../menu/infrastructure/persistence/tokens/menu.tokens.js';
import type { IMenuItemRepository } from '../../../menu/domain/repositories/menu-item.repository.js';
import type { IMenuModifierRepository } from '../../../menu/domain/repositories/menu-modifier.repository.js';

import { OrderingTokens } from '../../infrastructure/tokens/ordering.tokens.js';
import type { IOrderRepository } from '../../domain/repositories/order.repository.js';

import { CustomerTokens } from '../../../customer/infrastructure/persistence/tokens/customer.tokens.js';
import type { ICustomerRepository } from '../../../customer/domain/repositories/customer.repository.js';

@injectable()
export class PlaceOrderUseCaseImpl implements IPlaceOrderUseCase {
  constructor(
    @inject(OrderingTokens.OrderRepository)
    private readonly orderRepo: IOrderRepository,
    @inject(RestaurantTokens.RestaurantRepository)
    private readonly restaurantRepo: IRestaurantRepository,
    @inject(MenuTokens.MenuItemRepository)
    private readonly menuItemRepo: IMenuItemRepository,
    @inject(MenuTokens.MenuModifierRepository)
    private readonly menuModifierRepo: IMenuModifierRepository,
    @inject(CustomerTokens.CustomerRepository)
    private readonly customerRepo: ICustomerRepository,
  ) {}

  async execute(userId: string, dto: PlaceOrderDto): Promise<OrderResponseDto> {
    // 0. Validate Customer
    const customer = await this.customerRepo.findByUserId(userId);
    if (!customer) {
      throw new OrderingDomainError('Customer profile not found');
    }

    // 1. Validate Restaurant
    const restaurant = await this.restaurantRepo.findById(dto.restaurantId);
    if (!restaurant) {
      throw new OrderingDomainError('Restaurant not found');
    }

    // 2. Validate Items and Calculate Totals securely
    const orderItems: OrderItem[] = [];

    for (const itemDto of dto.items) {
      const menuItem = await this.menuItemRepo.findById(itemDto.menuItemId);
      if (!menuItem) {
        throw new OrderingDomainError(`Menu item ${itemDto.menuItemId} not found`);
      }
      if (menuItem.getRestaurantId() !== dto.restaurantId) {
        throw new OrderingDomainError(
          `Menu item ${itemDto.menuItemId} does not belong to this restaurant`,
        );
      }
      if (!menuItem.getIsAvailable()) {
        throw new OrderingDomainError(`Menu item ${itemDto.menuItemId} is not currently available`);
      }

      // 3. Process Modifiers
      const orderItemModifiers: OrderItemModifier[] = [];
      if (itemDto.modifierItemIds && itemDto.modifierItemIds.length > 0) {
        for (const modId of itemDto.modifierItemIds) {
          const modItem = await this.menuModifierRepo.findItemById(modId);
          if (!modItem) {
            throw new OrderingDomainError(`Modifier item ${modId} not found`);
          }
          if (!modItem.getIsAvailable()) {
            throw new OrderingDomainError(`Modifier item ${modId} is not available`);
          }

          // Verify modifier belongs to a group that is attached to the menu item
          // In a strict implementation, we would load the groups for the menu item and verify modItem.getModifierGroupId() is in them
          // For now, we trust the ID lookup but enforce restaurant boundary via groups
          const group = await this.menuModifierRepo.findGroupById(modItem.getModifierGroupId());
          if (!group || group.getRestaurantId() !== dto.restaurantId) {
            throw new OrderingDomainError(
              `Modifier item ${modId} does not belong to this restaurant`,
            );
          }

          orderItemModifiers.push(
            OrderItemModifier.create({
              orderItemId: 'temp', // will be replaced inside OrderItem.create if needed, but OrderItem.create does not need it initially
              menuModifierItemId: modId,
              name: modItem.getName(),
              price: modItem.getPriceAdjustment(),
            }),
          );
        }
      }

      // Create Order Item (Snapshotting prices)
      const orderItem = OrderItem.create({
        orderId: 'temp', // Replaced during order creation if DB uses DB-level cascading, or we set it later.
        // Actually, our OrderItem.create requires orderId, so we will generate it.
        menuItemId: menuItem.getId(),
        name: menuItem.getName(),
        unitPrice: menuItem.getPrice(),
        quantity: itemDto.quantity,
        specialInstructions: itemDto.specialInstructions,
        modifiers: orderItemModifiers,
      });
      orderItems.push(orderItem);
    }

    // Fixed dummy delivery fee & tax for now (in a real system, compute via distance & tax rules)
    const deliveryFee = dto.orderType === 'DELIVERY' ? Money.fromNumber(5.0) : Money.fromNumber(0);
    const taxAmount = Money.fromNumber(0); // Calculate properly based on subtotal

    const order = Order.create({
      customerId: customer.getId(),
      restaurantId: restaurant.getId(),
      restaurantName: restaurant.getName().getValue(),
      orderType: dto.orderType,
      deliveryFee,
      taxAmount,
      deliveryAddress: dto.deliveryAddress,
      specialInstructions: dto.specialInstructions,
      items: orderItems,
    });

    // Fix up IDs
    for (const item of order.getItems()) {
      (item as any).orderId = order.getId();
      for (const mod of item.getModifiers()) {
        (mod as any).orderItemId = item.getId();
      }
    }

    await this.orderRepo.save(order);

    return OrderDtoMapper.toResponse(order);
  }
}
