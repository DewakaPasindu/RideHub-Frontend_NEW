// Backward-compatibility shim — delegates to the new Laravel notification service.
import { NotificationService as LaravelNotificationService } from './notification.service';
import type { Notification } from './types';

export type { Notification };

export class NotificationService extends LaravelNotificationService {}
