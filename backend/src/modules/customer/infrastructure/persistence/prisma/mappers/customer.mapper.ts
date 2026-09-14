import { Prisma } from '../../../../../../../src/generated/prisma/client.js';
import { env } from '../../../../../../config/env.config.js';
import { Customer } from '../../../../domain/entities/index.js';
import { InvalidCustomerPreferencesError } from '../../../../domain/errors/invalid-customer-preferences.error.js';
import {
  CustomerAvatarUrl,
  CustomerFirstName,
  CustomerLastName,
  CustomerPhoneNumber,
  CustomerPreferences,
} from '../../../../domain/value-objects/index.js';

export class CustomerMapper {
  private static parsePreferences(value: Prisma.JsonValue): {
    language: string;
    notifications: {
      push: boolean;
      sms: boolean;
      email: boolean;
    };
    marketing: {
      enabled: boolean;
    };
  } {
    if (typeof value !== 'object' || Array.isArray(value) || !value) {
      throw new InvalidCustomerPreferencesError('Invalid customer preference format');
    }

    return value as {
      language: string;
      notifications: {
        push: boolean;
        sms: boolean;
        email: boolean;
      };
      marketing: {
        enabled: boolean;
      };
    };
  }

  public static toDomain(data: any): Customer {
    const preferences =
      data.preferences === null
        ? CustomerPreferences.default()
        : CustomerPreferences.create(this.parsePreferences(data.preferences));

    let resolvedAvatarUrl = data.avatarUrl;

    // Use media variants if available (e.g. thumbnail -> small -> original)
    if (data.avatarMedia?.variants?.length > 0) {
      const variants = data.avatarMedia.variants;
      const thumbnail = variants.find((v: any) => v.name === 'thumbnail');
      const small = variants.find((v: any) => v.name === 'small');

      const bestVariant = thumbnail || small || variants[0];
      resolvedAvatarUrl = `${env.R2_PUBLIC_URL}/${bestVariant.objectKey}`;
    }

    return Customer.rehydrate({
      id: data.id,
      userId: data.userId,
      firstName: CustomerFirstName.create(data.firstName),
      lastName: CustomerLastName.create(data.lastName),
      phone: CustomerPhoneNumber.create(data.phone),
      avatarUrl: resolvedAvatarUrl ? CustomerAvatarUrl.create(resolvedAvatarUrl) : null,
      preferences,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  public static toPersistence(customer: Customer): Prisma.CustomerCreateInput {
    const primitives = customer.toPrimitives();

    return {
      id: primitives.id,
      user: {
        connect: {
          id: primitives.userId,
        },
      },
      firstName: primitives.firstName,
      lastName: primitives.lastName,
      phone: primitives.phone,
      avatarUrl: primitives.avatarUrl,
      preferences: {
        language: primitives.preferences.language,
        notifications: {
          push: primitives.preferences.notifications.push,
          sms: primitives.preferences.notifications.sms,
          email: primitives.preferences.notifications.email,
        },
        marketing: {
          enabled: primitives.preferences.marketing.enabled,
        },
      },
      createdAt: primitives.createdAt,
      updatedAt: primitives.updatedAt,
    };
  }

  public static toUpdatePersistence(customer: Customer): Prisma.CustomerUpdateInput {
    const primitives = customer.toPrimitives();

    return {
      firstName: primitives.firstName,
      lastName: primitives.lastName,
      phone: primitives.phone,
      preferences: {
        language: primitives.preferences.language,
        notifications: {
          push: primitives.preferences.notifications.push,
          sms: primitives.preferences.notifications.sms,
          email: primitives.preferences.notifications.email,
        },
        marketing: {
          enabled: primitives.preferences.marketing.enabled,
        },
      },
      avatarUrl: primitives.avatarUrl,
      // If avatarUrl is being set to null, we also want to disconnect the media record
      ...(primitives.avatarUrl === null ? { avatarMediaId: null } : {}),
      updatedAt: primitives.updatedAt,
    };
  }
}
