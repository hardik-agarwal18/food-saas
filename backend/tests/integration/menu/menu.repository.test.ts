import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { prisma } from '../../../src/infrastructure/database/prisma.js';
import { MenuCategoryRepositoryImpl } from '../../../src/modules/menu/infrastructure/persistence/prisma/menu-category.repository.js';
import { MenuItemRepositoryImpl } from '../../../src/modules/menu/infrastructure/persistence/prisma/menu-item.repository.js';
import { MenuModifierRepositoryImpl } from '../../../src/modules/menu/infrastructure/persistence/prisma/menu-modifier.repository.js';
import { MenuCategory } from '../../../src/modules/menu/domain/entities/menu-category.entity.js';
import { MenuItem } from '../../../src/modules/menu/domain/entities/menu-item.entity.js';
import { MenuModifierGroup } from '../../../src/modules/menu/domain/entities/menu-modifier-group.entity.js';
import { MenuModifierItem } from '../../../src/modules/menu/domain/entities/menu-modifier-item.entity.js';
import { Money } from '../../../src/modules/menu/domain/value-objects/money.vo.js';
import { createTestUser } from '../../factories/user.factory.js';
import crypto from 'crypto';

describe('Menu Repositories Integration', () => {
  let categoryRepo: MenuCategoryRepositoryImpl;
  let itemRepo: MenuItemRepositoryImpl;
  let modifierRepo: MenuModifierRepositoryImpl;

  let testRestaurantId: string;

  beforeEach(async () => {
    const mockCacheService = {
      get: async () => null,
      set: async () => {},
      delete: async () => {},
      quit: async () => {},
    } as any;

    categoryRepo = new MenuCategoryRepositoryImpl(prisma, mockCacheService);
    itemRepo = new MenuItemRepositoryImpl(prisma, mockCacheService);
    modifierRepo = new MenuModifierRepositoryImpl(prisma, mockCacheService);

    const user = await createTestUser(prisma);
    
    const restaurant = await prisma.restaurant.create({
      data: {
        ownerId: user.getId(),
        name: 'Test Restaurant',
        description: 'Test Description',
        phoneNumber: '1234567890',
        email: 'test@restaurant.com',
        streetAddress: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        country: 'US',
        status: 'ACTIVE',
      },
    });

    testRestaurantId = restaurant.id;
  });

  describe('MenuCategoryRepository', () => {
    it('should save and find a menu category', async () => {
      const category = MenuCategory.create({
        restaurantId: testRestaurantId,
        name: 'Appetizers',
        description: 'Start your meal right',
        sortOrder: 0,
      });

      await categoryRepo.save(category);

      const found = await categoryRepo.findById(category.getId());
      expect(found).toBeDefined();
      expect(found?.getName()).toBe('Appetizers');
    });

    it('should update a menu category', async () => {
      const category = MenuCategory.create({
        restaurantId: testRestaurantId,
        name: 'Drinks',
      });
      await categoryRepo.save(category);

      category.updateProfile({ name: 'Beverages', description: 'Refreshing drinks', sortOrder: 1 });
      await categoryRepo.update(category);

      const found = await categoryRepo.findById(category.getId());
      expect(found?.getName()).toBe('Beverages');
      expect(found?.getSortOrder()).toBe(1);
    });

    it('should find categories by restaurant ID', async () => {
      const cat1 = MenuCategory.create({ restaurantId: testRestaurantId, name: 'Cat 1', sortOrder: 1 });
      const cat2 = MenuCategory.create({ restaurantId: testRestaurantId, name: 'Cat 2', sortOrder: 2 });
      await categoryRepo.save(cat1);
      await categoryRepo.save(cat2);

      const categories = await categoryRepo.findByRestaurantId(testRestaurantId);
      expect(categories).toHaveLength(2);
      expect(categories[0].getName()).toBe('Cat 1');
    });
  });

  describe('MenuItemRepository', () => {
    it('should save and find a menu item', async () => {
      const category = MenuCategory.create({ restaurantId: testRestaurantId, name: 'Mains' });
      await categoryRepo.save(category);

      const item = MenuItem.create({
        restaurantId: testRestaurantId,
        categoryId: category.getId(),
        name: 'Burger',
        description: 'Delicious burger',
        price: new Money(15.99, 'USD'),
      });

      await itemRepo.save(item);

      const found = await itemRepo.findById(item.getId());
      expect(found).toBeDefined();
      expect(found?.getName()).toBe('Burger');
      expect(found?.getPrice().getValue()).toBe(15.99);
    });

    it('should update a menu item', async () => {
      const item = MenuItem.create({
        restaurantId: testRestaurantId,
        name: 'Fries',
        price: new Money(3.99, 'USD'),
      });
      await itemRepo.save(item);

      item.updateDetails({ price: new Money(4.99, 'USD') });
      item.makeUnavailable();
      await itemRepo.update(item);

      const found = await itemRepo.findById(item.getId());
      expect(found?.getPrice().getValue()).toBe(4.99);
      expect(found?.getIsAvailable()).toBe(false);
    });

    it('should find items by restaurant ID and category ID', async () => {
      const category = MenuCategory.create({ restaurantId: testRestaurantId, name: 'Desserts' });
      await categoryRepo.save(category);
      const catId = category.getId();
      const item1 = MenuItem.create({ restaurantId: testRestaurantId, categoryId: catId, name: 'Item 1', price: new Money(1, 'USD') });
      const item2 = MenuItem.create({ restaurantId: testRestaurantId, categoryId: catId, name: 'Item 2', price: new Money(2, 'USD') });
      await itemRepo.save(item1);
      await itemRepo.save(item2);

      const allItems = await itemRepo.findByRestaurantId(testRestaurantId);
      expect(allItems.length).toBeGreaterThanOrEqual(2);

      const catItems = await itemRepo.findByCategoryId(catId);
      expect(catItems).toHaveLength(2);
    });
  });

  describe('MenuModifierRepository', () => {
    it('should save and find a modifier group', async () => {
      const group = MenuModifierGroup.create({
        restaurantId: testRestaurantId,
        name: 'Burger Add-ons',
        isRequired: false,
        minSelections: 0,
        maxSelections: 5,
      });

      await modifierRepo.saveGroup(group);

      const found = await modifierRepo.findGroupById(group.getId());
      expect(found).toBeDefined();
      expect(found?.getName()).toBe('Burger Add-ons');
    });

    it('should save and find modifier items', async () => {
      const group = MenuModifierGroup.create({
        restaurantId: testRestaurantId,
        name: 'Burger Add-ons',
        isRequired: false,
        minSelections: 0,
        maxSelections: 5,
      });
      await modifierRepo.saveGroup(group);

      const modItem = MenuModifierItem.create({
        modifierGroupId: group.getId(),
        name: 'Bacon',
        priceAdjustment: new Money(2.00, 'USD'),
      });
      await modifierRepo.saveItem(modItem);

      const items = await modifierRepo.findItemsByGroupId(group.getId());
      expect(items).toHaveLength(1);
      expect(items[0].getName()).toBe('Bacon');
      expect(items[0].getPriceAdjustment().getValue()).toBe(2);
    });
  });
});
