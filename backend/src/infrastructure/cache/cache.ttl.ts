export const CacheTTL = {
  IDENTITY: {
    USER_PROFILE: 60 * 60,
    SESSION: 15 * 60,
  },

  CUSTOMER: {
    PROFILE: 60 * 60,
    ADDRESSES: 30 * 60,
  },

  RESTAURANT: {
    PROFILE: 60 * 60,
    MENU: 5 * 60,
  },

  ORDERING: {
    ORDER: 15,
  },

  DRIVER: {
    PROFILE: 60,
    AVAILABILITY: 15,
  },
} as const;
