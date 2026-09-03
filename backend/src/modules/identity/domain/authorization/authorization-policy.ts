import { Role, Permission } from '../enums/index.js';

/**
 * Maps each application role to the permissions granted to that role.
 *
 * Readonly is used to prevent the permission policy from being modified
 * accidentally after the application starts.
 *
 * Each role contains a readonly list of permissions.
 */
export const ROLE_PERMISSIONS: Readonly<Record<Role, readonly Permission[]>> = {
  /**
   * Administrators have access to all major application operations.
   */
  [Role.ADMIN]: [
    Permission.ADMIN_ACCESS,

    // User management
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,

    // Restaurant management
    Permission.RESTAURANT_CREATE,
    Permission.RESTAURANT_READ,
    Permission.RESTAURANT_UPDATE,
    Permission.RESTAURANT_DELETE,

    // Menu management
    Permission.MENU_CREATE,
    Permission.MENU_READ,
    Permission.MENU_UPDATE,
    Permission.MENU_DELETE,

    // Order management
    Permission.ORDER_CREATE,
    Permission.ORDER_READ,
    Permission.ORDER_UPDATE,
    Permission.ORDER_CANCEL,

    // Delivery management
    Permission.DELIVERY_ASSIGN,
    Permission.DELIVERY_UPDATE,

    // Driver management
    Permission.DRIVER_READ,
    Permission.DRIVER_UPDATE,

    // Payment management
    Permission.PAYMENT_CREATE,
    Permission.PAYMENT_READ,
    Permission.PAYMENT_REFUND,
  ],

  /**
   * Customers can browse restaurants and menus.
   *
   * They can also create, view, and cancel their own orders.
   */
  [Role.CUSTOMER]: [
    Permission.RESTAURANT_READ,
    Permission.MENU_READ,

    Permission.ORDER_CREATE,
    Permission.ORDER_READ,
    Permission.ORDER_CANCEL,
  ],

  /**
   * Restaurant owners can manage their restaurants and menus.
   *
   * They can also view and update orders related to their restaurants.
   */
  [Role.RESTAURANT_OWNER]: [
    // Restaurant management
    Permission.RESTAURANT_CREATE,
    Permission.RESTAURANT_READ,
    Permission.RESTAURANT_UPDATE,

    // Menu management
    Permission.MENU_CREATE,
    Permission.MENU_READ,
    Permission.MENU_UPDATE,
    Permission.MENU_DELETE,

    // Order management
    Permission.ORDER_READ,
    Permission.ORDER_UPDATE,
  ],

  /**
   * Drivers can view orders and update delivery-related information.
   *
   * They can also read and update their driver profile or status.
   */
  [Role.DRIVER]: [
    Permission.ORDER_READ,

    Permission.DELIVERY_UPDATE,

    Permission.DRIVER_READ,
    Permission.DRIVER_UPDATE,
  ],
} as const;
