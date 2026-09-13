import { injectable, inject } from 'tsyringe';
import { InfrastructureTokens } from '../../../../../infrastructure/container/tokens/index.js';
import type { PrismaExecutor } from '../../../../../infrastructure/database/prisma-client.type.js';
import { BaseRepository } from '../../../../../infrastructure/database/base.repository.js';
import { IMenuModifierRepository } from '../../../domain/repositories/menu-modifier.repository.js';
import { MenuModifierGroup } from '../../../domain/entities/menu-modifier-group.entity.js';
import { MenuModifierItem } from '../../../domain/entities/menu-modifier-item.entity.js';
import { MenuModifierMapper } from './mappers/menu-modifier.mapper.js';
import { CacheService } from '../../../../../infrastructure/cache/cache.service.js';

@injectable()
export class MenuModifierRepositoryImpl extends BaseRepository implements IMenuModifierRepository {
  constructor(
    @inject(InfrastructureTokens.PrismaClient)
    prisma: PrismaExecutor,
    @inject(InfrastructureTokens.CacheService)
    private readonly cacheService: CacheService,
  ) {
    super(prisma);
  }

  async saveGroup(group: MenuModifierGroup): Promise<void> {
    const data = MenuModifierMapper.groupToCreateInput(group);
    await this.execute(() => this.prisma.menuModifierGroup.create({ data }));

    await this.cacheService.delete(`menu-modifier-group:id:${group.getId()}`);
    await this.cacheService.delete(`menu-modifier-group:restaurantId:${group.getRestaurantId()}`);
  }

  async updateGroup(group: MenuModifierGroup): Promise<void> {
    const data = MenuModifierMapper.groupToUpdateInput(group);
    await this.execute(() =>
      this.prisma.menuModifierGroup.update({
        where: { id: group.getId() },
        data,
      }),
    );

    await this.cacheService.delete(`menu-modifier-group:id:${group.getId()}`);
    await this.cacheService.delete(`menu-modifier-group:restaurantId:${group.getRestaurantId()}`);
  }

  async findGroupById(id: string): Promise<MenuModifierGroup | null> {
    const cacheKey = `menu-modifier-group:id:${id}`;
    const cached = await this.cacheService.get<any>(cacheKey);

    if (cached) {
      if (typeof cached.createdAt === 'string') cached.createdAt = new Date(cached.createdAt);
      if (typeof cached.updatedAt === 'string') cached.updatedAt = new Date(cached.updatedAt);
      if (cached.deletedAt && typeof cached.deletedAt === 'string')
        cached.deletedAt = new Date(cached.deletedAt);
      return MenuModifierMapper.groupToDomain(cached);
    }

    const raw = await this.execute(() =>
      this.prisma.menuModifierGroup.findUnique({ where: { id } }),
    );
    if (!raw) return null;

    await this.cacheService.set(cacheKey, raw, 3600);
    return MenuModifierMapper.groupToDomain(raw);
  }

  async findGroupsByRestaurantId(restaurantId: string): Promise<MenuModifierGroup[]> {
    const cacheKey = `menu-modifier-group:restaurantId:${restaurantId}`;
    const cachedList = await this.cacheService.get<any[]>(cacheKey);

    if (cachedList && Array.isArray(cachedList)) {
      return cachedList.map((cached) => {
        if (typeof cached.createdAt === 'string') cached.createdAt = new Date(cached.createdAt);
        if (typeof cached.updatedAt === 'string') cached.updatedAt = new Date(cached.updatedAt);
        if (cached.deletedAt && typeof cached.deletedAt === 'string')
          cached.deletedAt = new Date(cached.deletedAt);
        return MenuModifierMapper.groupToDomain(cached);
      });
    }

    const rawList = await this.execute(() =>
      this.prisma.menuModifierGroup.findMany({
        where: { restaurantId, deletedAt: null },
      }),
    );

    await this.cacheService.set(cacheKey, rawList, 3600);
    return rawList.map((r) => MenuModifierMapper.groupToDomain(r));
  }

  async findGroupsByMenuItemId(menuItemId: string): Promise<MenuModifierGroup[]> {
    const cacheKey = `menu-modifier-group:menuItemId:${menuItemId}`;
    const cachedList = await this.cacheService.get<any[]>(cacheKey);

    if (cachedList && Array.isArray(cachedList)) {
      return cachedList.map((cached) => {
        if (typeof cached.createdAt === 'string') cached.createdAt = new Date(cached.createdAt);
        if (typeof cached.updatedAt === 'string') cached.updatedAt = new Date(cached.updatedAt);
        if (cached.deletedAt && typeof cached.deletedAt === 'string')
          cached.deletedAt = new Date(cached.deletedAt);
        return MenuModifierMapper.groupToDomain(cached);
      });
    }

    const links = await this.execute(() =>
      this.prisma.menuItemToModifierGroup.findMany({
        where: { menuItemId },
        include: { modifierGroup: true },
        orderBy: { sortOrder: 'asc' },
      }),
    );

    const rawList = links
      .filter((link) => link.modifierGroup.deletedAt === null)
      .map((link) => link.modifierGroup);

    await this.cacheService.set(cacheKey, rawList, 3600);
    return rawList.map((r) => MenuModifierMapper.groupToDomain(r));
  }

  async saveItem(item: MenuModifierItem): Promise<void> {
    const data = MenuModifierMapper.itemToCreateInput(item);
    await this.execute(() => this.prisma.menuModifierItem.create({ data }));

    await this.cacheService.delete(`menu-modifier-item:id:${item.getId()}`);
    await this.cacheService.delete(`menu-modifier-item:groupId:${item.getModifierGroupId()}`);
  }

  async updateItem(item: MenuModifierItem): Promise<void> {
    const data = MenuModifierMapper.itemToUpdateInput(item);
    await this.execute(() =>
      this.prisma.menuModifierItem.update({
        where: { id: item.getId() },
        data,
      }),
    );

    await this.cacheService.delete(`menu-modifier-item:id:${item.getId()}`);
    await this.cacheService.delete(`menu-modifier-item:groupId:${item.getModifierGroupId()}`);
  }

  async findItemById(id: string): Promise<MenuModifierItem | null> {
    const cacheKey = `menu-modifier-item:id:${id}`;
    const cached = await this.cacheService.get<any>(cacheKey);

    if (cached) {
      if (typeof cached.createdAt === 'string') cached.createdAt = new Date(cached.createdAt);
      if (typeof cached.updatedAt === 'string') cached.updatedAt = new Date(cached.updatedAt);
      if (cached.deletedAt && typeof cached.deletedAt === 'string')
        cached.deletedAt = new Date(cached.deletedAt);
      return MenuModifierMapper.itemToDomain(cached);
    }

    const raw = await this.execute(() =>
      this.prisma.menuModifierItem.findUnique({ where: { id } }),
    );
    if (!raw) return null;

    await this.cacheService.set(cacheKey, raw, 3600);
    return MenuModifierMapper.itemToDomain(raw);
  }

  async findItemsByGroupId(groupId: string): Promise<MenuModifierItem[]> {
    const cacheKey = `menu-modifier-item:groupId:${groupId}`;
    const cachedList = await this.cacheService.get<any[]>(cacheKey);

    if (cachedList && Array.isArray(cachedList)) {
      return cachedList.map((cached) => {
        if (typeof cached.createdAt === 'string') cached.createdAt = new Date(cached.createdAt);
        if (typeof cached.updatedAt === 'string') cached.updatedAt = new Date(cached.updatedAt);
        if (cached.deletedAt && typeof cached.deletedAt === 'string')
          cached.deletedAt = new Date(cached.deletedAt);
        return MenuModifierMapper.itemToDomain(cached);
      });
    }

    const rawList = await this.execute(() =>
      this.prisma.menuModifierItem.findMany({
        where: { modifierGroupId: groupId, deletedAt: null },
        orderBy: { sortOrder: 'asc' },
      }),
    );

    await this.cacheService.set(cacheKey, rawList, 3600);
    return rawList.map((r) => MenuModifierMapper.itemToDomain(r));
  }
}
