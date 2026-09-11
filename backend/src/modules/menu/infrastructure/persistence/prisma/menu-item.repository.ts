import { injectable, inject } from 'tsyringe';
import { InfrastructureTokens } from '../../../../../infrastructure/container/tokens/index.js';
import type { PrismaExecutor } from '../../../../../infrastructure/database/prisma-client.type.js';
import { BaseRepository } from '../../../../../infrastructure/database/base.repository.js';
import { IMenuItemRepository } from '../../../domain/repositories/menu-item.repository.js';
import { MenuItem } from '../../../domain/entities/menu-item.entity.js';
import { MenuItemMapper } from './mappers/menu-item.mapper.js';

@injectable()
export class MenuItemRepositoryImpl extends BaseRepository implements IMenuItemRepository {
  constructor(
    @inject(InfrastructureTokens.PrismaClient)
    prisma: PrismaExecutor,
  ) {
    super(prisma);
  }

  async save(item: MenuItem): Promise<void> {
    const data = MenuItemMapper.toCreateInput(item);
    await this.execute(() => this.prisma.menuItem.create({ data }));
  }

  async update(item: MenuItem): Promise<void> {
    const data = MenuItemMapper.toUpdateInput(item);
    await this.execute(() =>
      this.prisma.menuItem.update({
        where: { id: item.getId() },
        data,
      }),
    );
  }

  async findById(id: string): Promise<MenuItem | null> {
    const raw = await this.execute(() =>
      this.prisma.menuItem.findUnique({
        where: { id },
        include: { modifierGroups: true },
      }),
    );
    if (!raw) return null;
    return MenuItemMapper.toDomain(raw);
  }

  async findByRestaurantId(restaurantId: string): Promise<MenuItem[]> {
    const rawList = await this.execute(() =>
      this.prisma.menuItem.findMany({
        where: { restaurantId, deletedAt: null },
        include: { modifierGroups: true },
        orderBy: { sortOrder: 'asc' },
      }),
    );
    return rawList.map((r) => MenuItemMapper.toDomain(r));
  }

  async findByCategoryId(categoryId: string): Promise<MenuItem[]> {
    const rawList = await this.execute(() =>
      this.prisma.menuItem.findMany({
        where: { categoryId, deletedAt: null },
        include: { modifierGroups: true },
        orderBy: { sortOrder: 'asc' },
      }),
    );
    return rawList.map((r) => MenuItemMapper.toDomain(r));
  }
}
