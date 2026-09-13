import { injectable, inject } from 'tsyringe';
import { InfrastructureTokens } from '../../../../../infrastructure/container/tokens/index.js';
import type { PrismaExecutor } from '../../../../../infrastructure/database/prisma-client.type.js';
import { BaseRepository } from '../../../../../infrastructure/database/base.repository.js';
import { IMenuItemRepository } from '../../../domain/repositories/menu-item.repository.js';
import { MenuItem } from '../../../domain/entities/menu-item.entity.js';
import { MenuItemMapper } from './mappers/menu-item.mapper.js';
import { CacheService } from '../../../../../infrastructure/cache/cache.service.js';

@injectable()
export class MenuItemRepositoryImpl extends BaseRepository implements IMenuItemRepository {
  constructor(
    @inject(InfrastructureTokens.PrismaClient)
    prisma: PrismaExecutor,
    @inject(InfrastructureTokens.CacheService)
    private readonly cacheService: CacheService,
  ) {
    super(prisma);
  }

  async save(item: MenuItem): Promise<void> {
    const data = MenuItemMapper.toCreateInput(item);
    await this.execute(() => this.prisma.menuItem.create({ data }));

    await this.cacheService.delete(`menu-item:id:${item.getId()}`);
    await this.cacheService.delete(`menu-item:restaurantId:${item.getRestaurantId()}`);
    await this.cacheService.delete(`menu-item:categoryId:${item.getCategoryId()}`);
  }

  async update(item: MenuItem): Promise<void> {
    const data = MenuItemMapper.toUpdateInput(item);
    await this.execute(() =>
      this.prisma.menuItem.update({
        where: { id: item.getId() },
        data,
      }),
    );

    await this.cacheService.delete(`menu-item:id:${item.getId()}`);
    await this.cacheService.delete(`menu-item:restaurantId:${item.getRestaurantId()}`);
    await this.cacheService.delete(`menu-item:categoryId:${item.getCategoryId()}`);
  }

  async findById(id: string): Promise<MenuItem | null> {
    const cacheKey = `menu-item:id:${id}`;
    const cached = await this.cacheService.get<any>(cacheKey);

    if (cached) {
      if (typeof cached.createdAt === 'string') cached.createdAt = new Date(cached.createdAt);
      if (typeof cached.updatedAt === 'string') cached.updatedAt = new Date(cached.updatedAt);
      if (cached.deletedAt && typeof cached.deletedAt === 'string')
        cached.deletedAt = new Date(cached.deletedAt);
      return MenuItemMapper.toDomain(cached);
    }

    const raw = await this.execute(() =>
      this.prisma.menuItem.findUnique({
        where: { id },
        include: { modifierGroups: true },
      }),
    );
    if (!raw) return null;

    await this.cacheService.set(cacheKey, raw, 3600);
    return MenuItemMapper.toDomain(raw);
  }

  async findByRestaurantId(restaurantId: string): Promise<MenuItem[]> {
    const cacheKey = `menu-item:restaurantId:${restaurantId}`;
    const cachedList = await this.cacheService.get<any[]>(cacheKey);

    if (cachedList && Array.isArray(cachedList)) {
      return cachedList.map((cached) => {
        if (typeof cached.createdAt === 'string') cached.createdAt = new Date(cached.createdAt);
        if (typeof cached.updatedAt === 'string') cached.updatedAt = new Date(cached.updatedAt);
        if (cached.deletedAt && typeof cached.deletedAt === 'string')
          cached.deletedAt = new Date(cached.deletedAt);
        return MenuItemMapper.toDomain(cached);
      });
    }

    const rawList = await this.execute(() =>
      this.prisma.menuItem.findMany({
        where: { restaurantId, deletedAt: null },
        include: { modifierGroups: true },
        orderBy: { sortOrder: 'asc' },
      }),
    );

    await this.cacheService.set(cacheKey, rawList, 3600);
    return rawList.map((r) => MenuItemMapper.toDomain(r));
  }

  async findByCategoryId(categoryId: string): Promise<MenuItem[]> {
    const cacheKey = `menu-item:categoryId:${categoryId}`;
    const cachedList = await this.cacheService.get<any[]>(cacheKey);

    if (cachedList && Array.isArray(cachedList)) {
      return cachedList.map((cached) => {
        if (typeof cached.createdAt === 'string') cached.createdAt = new Date(cached.createdAt);
        if (typeof cached.updatedAt === 'string') cached.updatedAt = new Date(cached.updatedAt);
        if (cached.deletedAt && typeof cached.deletedAt === 'string')
          cached.deletedAt = new Date(cached.deletedAt);
        return MenuItemMapper.toDomain(cached);
      });
    }

    const rawList = await this.execute(() =>
      this.prisma.menuItem.findMany({
        where: { categoryId, deletedAt: null },
        include: { modifierGroups: true },
        orderBy: { sortOrder: 'asc' },
      }),
    );

    await this.cacheService.set(cacheKey, rawList, 3600);
    return rawList.map((r) => MenuItemMapper.toDomain(r));
  }
}
