import { Prisma } from '../../../../../../generated/prisma/client.js';
import { Restaurant, RestaurantStatus } from '../../../../domain/entities/restaurant.entity.js';
import { RestaurantName, Address } from '../../../../domain/value-objects/index.js';
import { CustomerPhoneNumber } from '../../../../../customer/domain/value-objects/index.js';
import { Email } from '../../../../../identity/domain/value-objects/email.vo.js';

export class RestaurantMapper {
  static toDomain(raw: Prisma.RestaurantGetPayload<{}>): Restaurant {
    let domainStatus: RestaurantStatus;
    switch (raw.status) {
      case 'PENDING':
        domainStatus = RestaurantStatus.PENDING;
        break;
      case 'ACTIVE':
        domainStatus = RestaurantStatus.ACTIVE;
        break;
      case 'INACTIVE':
        domainStatus = RestaurantStatus.INACTIVE;
        break;
      case 'SUSPENDED':
        domainStatus = RestaurantStatus.SUSPENDED;
        break;
      default:
        domainStatus = RestaurantStatus.PENDING;
    }

    return Restaurant.rehydrate({
      id: raw.id,
      ownerId: raw.ownerId,
      name: new RestaurantName(raw.name),
      description: raw.description,
      logoUrl: raw.logoUrl,
      coverImageUrl: raw.coverImageUrl,
      phoneNumber: new CustomerPhoneNumber(raw.phoneNumber),
      email: new Email(raw.email),
      address: new Address({
        streetAddress: raw.streetAddress,
        city: raw.city,
        state: raw.state,
        zipCode: raw.zipCode,
        country: raw.country,
      }),
      latitude: raw.latitude ? Number(raw.latitude) : null,
      longitude: raw.longitude ? Number(raw.longitude) : null,
      status: domainStatus,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
    });
  }

  static toCreateInput(domain: Restaurant): Prisma.RestaurantCreateInput {
    return {
      id: domain.getId(),
      owner: { connect: { id: domain.getOwnerId() } },
      name: domain.getName().getValue(),
      description: domain.getDescription(),
      logoUrl: domain.getLogoUrl(),
      coverImageUrl: domain.getCoverImageUrl(),
      phoneNumber: domain.getPhoneNumber().getValue(),
      email: domain.getEmail().getValue(),
      streetAddress: domain.getAddress().getStreetAddress(),
      city: domain.getAddress().getCity(),
      state: domain.getAddress().getState(),
      zipCode: domain.getAddress().getZipCode(),
      country: domain.getAddress().getCountry(),
      latitude: domain.getLatitude() ?? undefined,
      longitude: domain.getLongitude() ?? undefined,
      status: domain.getStatus(),
      createdAt: domain.getCreatedAt(),
      updatedAt: domain.getUpdatedAt(),
      deletedAt: domain.getDeletedAt() ?? undefined,
    };
  }

  static toUpdateInput(domain: Restaurant): Prisma.RestaurantUpdateInput {
    return {
      name: domain.getName().getValue(),
      description: domain.getDescription(),
      logoUrl: domain.getLogoUrl(),
      coverImageUrl: domain.getCoverImageUrl(),
      phoneNumber: domain.getPhoneNumber().getValue(),
      email: domain.getEmail().getValue(),
      streetAddress: domain.getAddress().getStreetAddress(),
      city: domain.getAddress().getCity(),
      state: domain.getAddress().getState(),
      zipCode: domain.getAddress().getZipCode(),
      country: domain.getAddress().getCountry(),
      latitude: domain.getLatitude() ?? undefined,
      longitude: domain.getLongitude() ?? undefined,
      status: domain.getStatus(),
      updatedAt: domain.getUpdatedAt(),
      deletedAt: domain.getDeletedAt() ?? undefined,
    };
  }
}
