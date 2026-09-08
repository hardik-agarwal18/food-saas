import { injectable, inject } from 'tsyringe';
import { InfrastructureTokens } from '../../../../../infrastructure/container/tokens/index.js';
import type { PrismaExecutor } from '../../../../../infrastructure/database/prisma-client.type.js';
import { BaseRepository } from '../../../../../infrastructure/database/base.repository.js';
import { IMenuCategoryRepository } from '../../../domain/repositories/menu-category.repository.js';
import { MenuCategory } from '../../../domain/entities/menu-category.entity.js';
import { MenuCategoryMapper } from './mappers/menu-category.mapper.js';

@injectable()
export class MenuCategoryRepositoryImpl extends BaseRepository implements IMenuCategoryRepository {
  constructor(
    @inject(InfrastructureTokens.PrismaClient)
    prisma: PrismaExecutor,
  ) {
    super(prisma);
  }

  async save(category: MenuCategory): Promise<void> {
    const data = MenuCategoryMapper.toCreateInput(category);
    await this.execute(() => this.prisma.menuCategory.create({ data }));
  }

  async update(category: MenuCategory): Promise<void> {
    const data = MenuCategoryMapper.toUpdateInput(category);
    await this.execute(() =>
      this.prisma.menuCategory.update({
        where: { id: category.getId() },
        data,
      }),
    );
  }

  async findById(id: string): Promise<MenuCategory | null> {
    const raw = await this.execute(() => this.prisma.menuCategory.findUnique({ where: { id } }));
    if (!raw) return null;
    return MenuCategoryMapper.toDomain(raw);
  }

  async findByRestaurantId(restaurantId: string): Promise<MenuCategory[]> {
    const rawList = await this.execute(() =>
      this.prisma.menuCategory.findMany({
        where: { restaurantId, deletedAt: null },
        orderBy: { sortOrder: 'asc' },
      }),
    );
    return rawList.map((r) => MenuCategoryMapper.toDomain(r));
  }
}
