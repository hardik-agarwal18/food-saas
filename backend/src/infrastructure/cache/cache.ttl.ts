/**
 * Default cache time-to-live values.
 *
 * All values are expressed in seconds because Redis EXPIRE
 * and SET EX commands use seconds in this implementation.
 */
export const CacheTTL = {
  IDENTITY: {
    /**
     * User profile data remains cached for one hour.
     */
    USER_PROFILE: 60 * 60,

    /**
     * Session data remains cached for fifteen minutes.
     */
    SESSION: 15 * 60,
  },

  CUSTOMER: {
    /**
     * Customer profile data remains cached for one hour.
     */
    PROFILE: 60 * 60,

    /**
     * Customer addresses remain cached for thirty minutes.
     */
    ADDRESSES: 30 * 60,
  },

  RESTAURANT: {
    /**
     * Restaurant information remains cached for one hour.
     */
    PROFILE: 60 * 60,

    /**
     * Menu data remains cached for five minutes.
     */
    MENU: 5 * 60,
  },

  ORDERING: {
    /**
     * Order data has a short fifteen-second lifetime.
     */
    ORDER: 15,
  },

  DRIVER: {
    /**
     * Driver profile data remains cached for one minute.
     */
    PROFILE: 60,

    /**
     * Driver availability is refreshed frequently.
     */
    AVAILABILITY: 15,
  },
} as const;
