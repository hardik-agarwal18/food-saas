export interface PushNotificationService {
  /**
   * Sends a simulated push notification to a user's device.
   * @param userId The ID of the user to send the notification to.
   * @param title The title of the notification.
   * @param body The body text of the notification.
   * @param data Optional metadata payload.
   */
  sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void>;
}
