import { injectable, inject } from 'tsyringe';
import { InfrastructureTokens } from '../../../../../infrastructure/container/tokens/index.js';
import type { PrismaExecutor } from '../../../../../infrastructure/database/prisma-client.type.js';
import { BaseRepository } from '../../../../../infrastructure/database/base.repository.js';
import { IMenuModifierRepository } from '../../../domain/repositories/menu-modifier.repository.js';
import { MenuModifierGroup } from '../../../domain/entities/menu-modifier-group.entity.js';
import { MenuModifierItem } from '../../../domain/entities/menu-modifier-item.entity.js';
import { MenuModifierMapper } from './mappers/menu-modifier.mapper.js';

@injectable()
export class MenuModifierRepositoryImpl extends BaseRepository implements IMenuModifierRepository {
  constructor(
    @inject(InfrastructureTokens.PrismaClient)
    prisma: PrismaExecutor,
  ) {
    super(prisma);
  }

  async saveGroup(group: MenuModifierGroup): Promise<void> {
    const data = MenuModifierMapper.groupToCreateInput(group);
    await this.execute(() => this.prisma.menuModifierGroup.create({ data }));
  }

  async updateGroup(group: MenuModifierGroup): Promise<void> {
    const data = MenuModifierMapper.groupToUpdateInput(group);
    await this.execute(() =>
      this.prisma.menuModifierGroup.update({
        where: { id: group.getId() },
        data,
      }),
    );
  }

  async findGroupById(id: string): Promise<MenuModifierGroup | null> {
    const raw = await this.execute(() =>
      this.prisma.menuModifierGroup.findUnique({ where: { id } }),
    );
    if (!raw) return null;
    return MenuModifierMapper.groupToDomain(raw);
  }

  async findGroupsByRestaurantId(restaurantId: string): Promise<MenuModifierGroup[]> {
    const rawList = await this.execute(() =>
      this.prisma.menuModifierGroup.findMany({
        where: { restaurantId, deletedAt: null },
      }),
    );
    return rawList.map((r) => MenuModifierMapper.groupToDomain(r));
  }

  async findGroupsByMenuItemId(menuItemId: string): Promise<MenuModifierGroup[]> {
    const links = await this.execute(() =>
      this.prisma.menuItemToModifierGroup.findMany({
        where: { menuItemId },
        include: { modifierGroup: true },
        orderBy: { sortOrder: 'asc' },
      }),
    );
    return links
      .filter((link) => link.modifierGroup.deletedAt === null)
      .map((link) => MenuModifierMapper.groupToDomain(link.modifierGroup));
  }

  async saveItem(item: MenuModifierItem): Promise<void> {
    const data = MenuModifierMapper.itemToCreateInput(item);
    await this.execute(() => this.prisma.menuModifierItem.create({ data }));
  }

  async updateItem(item: MenuModifierItem): Promise<void> {
    const data = MenuModifierMapper.itemToUpdateInput(item);
    await this.execute(() =>
      this.prisma.menuModifierItem.update({
        where: { id: item.getId() },
        data,
      }),
    );
  }

  async findItemById(id: string): Promise<MenuModifierItem | null> {
    const raw = await this.execute(() =>
      this.prisma.menuModifierItem.findUnique({ where: { id } }),
    );
    if (!raw) return null;
    return MenuModifierMapper.itemToDomain(raw);
  }

  async findItemsByGroupId(groupId: string): Promise<MenuModifierItem[]> {
    const rawList = await this.execute(() =>
      this.prisma.menuModifierItem.findMany({
        where: { modifierGroupId: groupId, deletedAt: null },
        orderBy: { sortOrder: 'asc' },
      }),
    );
    return rawList.map((r) => MenuModifierMapper.itemToDomain(r));
  }
}
