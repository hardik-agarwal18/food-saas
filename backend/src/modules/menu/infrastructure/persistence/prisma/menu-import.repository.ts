import { injectable, inject } from 'tsyringe';
import { InfrastructureTokens } from '../../../../../infrastructure/container/tokens/index.js';
import type { PrismaExecutor } from '../../../../../infrastructure/database/prisma-client.type.js';
import { BaseRepository } from '../../../../../infrastructure/database/base.repository.js';
import { MenuImportRepository } from '../../../domain/repositories/menu-import.repository.js';
import { MenuImport } from '../../../domain/entities/menu-import.entity.js';
import { MenuImportMapper } from './mappers/menu-import.mapper.js';
import { MenuDomainError } from '../../../domain/errors/menu-domain.error.js';

@injectable()
export class MenuImportRepositoryImpl extends BaseRepository implements MenuImportRepository {
  constructor(
    @inject(InfrastructureTokens.PrismaClient)
    prisma: PrismaExecutor,
  ) {
    super(prisma);
  }

  async findById(id: string): Promise<MenuImport | null> {
    const raw = await this.execute(() => this.prisma.menuImport.findUnique({ where: { id } }));
    if (!raw) return null;
    return MenuImportMapper.toDomain(raw);
  }

  async findByIdForUpdate(id: string): Promise<MenuImport | null> {
    // In Prisma, optimistic concurrency is better handled on update using `where: { id, version }`.
    // But we still need to load it first.
    return this.findById(id);
  }

  async create(menuImport: MenuImport): Promise<void> {
    const data = MenuImportMapper.toPersistence(menuImport);
    await this.execute(() => this.prisma.menuImport.create({ data }));
  }

  async save(menuImport: MenuImport): Promise<void> {
    const data = MenuImportMapper.toPersistence(menuImport);
    const expectedVersion = data.version;
    data.version += 1; // Increment version

    const result = await this.execute(() =>
      this.prisma.menuImport.updateMany({
        where: { id: menuImport.getId(), version: expectedVersion },
        data,
      }),
    );

    if (result.count === 0) {
      throw new MenuDomainError(
        'Optimistic concurrency control failed. The entity was modified by another transaction.',
      );
    }
  }
}
