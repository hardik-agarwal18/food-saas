import { injectable, inject } from 'tsyringe';
import { InfrastructureTokens } from '../../../../../infrastructure/container/tokens/index.js';
import type { PrismaExecutor } from '../../../../../infrastructure/database/prisma-client.type.js';
import { BaseRepository } from '../../../../../infrastructure/database/base.repository.js';
import { IMenuCategoryRepository } from '../../../domain/repositories/menu-category.repository.js';
import { MenuCategory } from '../../../domain/entities/menu-category.entity.js';
import { MenuCategoryMapper } from './mappers/menu-category.mapper.js';
import { CacheService } from '../../../../../infrastructure/cache/cache.service.js';

@injectable()
export class MenuCategoryRepositoryImpl extends BaseRepository implements IMenuCategoryRepository {
  constructor(
    @inject(InfrastructureTokens.PrismaClient)
    prisma: PrismaExecutor,
    @inject(InfrastructureTokens.CacheService)
    private readonly cacheService: CacheService,
  ) {
    super(prisma);
  }

  async save(category: MenuCategory): Promise<void> {
    const data = MenuCategoryMapper.toCreateInput(category);
    await this.execute(() => this.prisma.menuCategory.create({ data }));

    await this.cacheService.delete(`menu-category:id:${category.getId()}`);
    await this.cacheService.delete(`menu-category:restaurantId:${category.getRestaurantId()}`);
  }

  async update(category: MenuCategory): Promise<void> {
    const data = MenuCategoryMapper.toUpdateInput(category);
    await this.execute(() =>
      this.prisma.menuCategory.update({
        where: { id: category.getId() },
        data,
      }),
    );

    await this.cacheService.delete(`menu-category:id:${category.getId()}`);
    await this.cacheService.delete(`menu-category:restaurantId:${category.getRestaurantId()}`);
  }

  async findById(id: string): Promise<MenuCategory | null> {
    const cacheKey = `menu-category:id:${id}`;
    const cached = await this.cacheService.get<any>(cacheKey);

    if (cached) {
      if (typeof cached.createdAt === 'string') cached.createdAt = new Date(cached.createdAt);
      if (typeof cached.updatedAt === 'string') cached.updatedAt = new Date(cached.updatedAt);
      if (cached.deletedAt && typeof cached.deletedAt === 'string')
        cached.deletedAt = new Date(cached.deletedAt);
      return MenuCategoryMapper.toDomain(cached);
    }

    const raw = await this.execute(() => this.prisma.menuCategory.findUnique({ where: { id } }));
    if (!raw) return null;

    await this.cacheService.set(cacheKey, raw, 3600);
    return MenuCategoryMapper.toDomain(raw);
  }

  async findByRestaurantId(restaurantId: string): Promise<MenuCategory[]> {
    const cacheKey = `menu-category:restaurantId:${restaurantId}`;
    const cachedList = await this.cacheService.get<any[]>(cacheKey);

    if (cachedList && Array.isArray(cachedList)) {
      return cachedList.map((cached) => {
        if (typeof cached.createdAt === 'string') cached.createdAt = new Date(cached.createdAt);
        if (typeof cached.updatedAt === 'string') cached.updatedAt = new Date(cached.updatedAt);
        if (cached.deletedAt && typeof cached.deletedAt === 'string')
          cached.deletedAt = new Date(cached.deletedAt);
        return MenuCategoryMapper.toDomain(cached);
      });
    }

    const rawList = await this.execute(() =>
      this.prisma.menuCategory.findMany({
        where: { restaurantId, deletedAt: null },
        orderBy: { sortOrder: 'asc' },
      }),
    );

    await this.cacheService.set(cacheKey, rawList, 3600);
    return rawList.map((r) => MenuCategoryMapper.toDomain(r));
  }
}
