import { injectable, inject } from 'tsyringe';
import * as h3 from 'h3-js';
import { InfrastructureTokens } from '../../../../../infrastructure/container/tokens/index.js';
import type { PrismaExecutor } from '../../../../../infrastructure/database/prisma-client.type.js';
import { BaseRepository } from '../../../../../infrastructure/database/base.repository.js';
import { IRestaurantRepository } from '../../../domain/repositories/restaurant.repository.js';
import { Restaurant, RestaurantStatus } from '../../../domain/entities/restaurant.entity.js';
import { RestaurantMapper } from './mappers/restaurant.mapper.js';

@injectable()
export class RestaurantRepositoryImpl extends BaseRepository implements IRestaurantRepository {
  constructor(
    @inject(InfrastructureTokens.PrismaClient)
    prisma: PrismaExecutor,
  ) {
    super(prisma);
  }

  async save(restaurant: Restaurant): Promise<void> {
    const data = RestaurantMapper.toCreateInput(restaurant);
    const h3Cell = this.computeH3Cell(restaurant.getLatitude(), restaurant.getLongitude());
    await this.execute(() => this.prisma.restaurant.create({ data: { ...data, h3Cell } }));
  }

  async update(restaurant: Restaurant): Promise<void> {
    const data = RestaurantMapper.toUpdateInput(restaurant);
    const h3Cell = this.computeH3Cell(restaurant.getLatitude(), restaurant.getLongitude());
    await this.execute(() =>
      this.prisma.restaurant.update({
        where: { id: restaurant.getId() },
        data: { ...data, h3Cell },
      }),
    );
  }

  private computeH3Cell(lat: number | null, lng: number | null): string | null {
    if (lat === null || lng === null) return null;
    const resolution = Number(process.env.GEO_H3_RESOLUTION || 8);
    return h3.latLngToCell(lat, lng, resolution);
  }

  async findById(id: string): Promise<Restaurant | null> {
    const raw = await this.execute(() => this.prisma.restaurant.findUnique({ where: { id } }));
    if (!raw) return null;
    return RestaurantMapper.toDomain(raw);
  }

  async findByOwnerId(ownerId: string): Promise<Restaurant[]> {
    const rawList = await this.execute(() =>
      this.prisma.restaurant.findMany({
        where: { ownerId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
      }),
    );
    return rawList.map((r) => RestaurantMapper.toDomain(r));
  }

  async findAll(params: {
    status?: RestaurantStatus;
    city?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ items: Restaurant[]; total: number }> {
    const where: any = { deletedAt: null };

    if (params.status) where.status = params.status;
    if (params.city) where.city = params.city;

    const [total, rawList] = await Promise.all([
      this.execute(() => this.prisma.restaurant.count({ where })),
      this.execute(() =>
        this.prisma.restaurant.findMany({
          where,
          take: params.limit ?? 20,
          skip: params.offset ?? 0,
          orderBy: { createdAt: 'desc' },
        }),
      ),
    ]);

    return {
      items: rawList.map((r) => RestaurantMapper.toDomain(r)),
      total,
    };
  }
}
