import api, { withRetry, unwrap } from './client';
import type { Notification } from './types';

export class NotificationService {
  static async list(): Promise<Notification[]> {
    const { data } = await withRetry(() =>
      api.get<{ data: Notification[] } | Notification[]>('/notifications')
    );
    return unwrap<Notification[]>({ data });
  }

  static async markRead(id: string): Promise<void> {
    await api.put(`/notifications/${id}/read`);
  }

  static async markAllRead(): Promise<void> {
    await api.post('/notifications/read-all');
  }

  static async getUnreadCount(): Promise<number> {
    try {
      const { data } = await api.get<{ count: number } | { data: { count: number } }>('/notifications/unread-count');
      const body = data as { count?: number; data?: { count?: number } };
      return body.count ?? body.data?.count ?? 0;
    } catch {
      return 0;
    }
  }
}

export default NotificationService;
