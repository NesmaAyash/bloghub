/**
 * Notification Service
 * 
 * Handles all notification-related API calls
 */

import apiClient, { handleApiError } from './api.client';

class NotificationService {

async getNotifications(): Promise<any[]> {
  try {
    const response = await apiClient.get('/Notification');
    console.log('Notifications response:', response.data); // ← أضف هذا
    return response.data.notifications ?? [];
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}
 
  async getUnreadCount(): Promise<number> {
    try {
      const response = await apiClient.get('/Notification/unread-count');
      return response.data.count ?? 0;
    } catch (error) {
      return 0;
    }
  }
async markAsRead(id: number): Promise<void> {
  try {
    await apiClient.put(`/Notification/${id}/read`); // ← PUT مش POST
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

async markAllAsRead(): Promise<void> {
  try {
    await apiClient.put('/Notification/mark-all-read'); // ← PUT مش POST
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}
}

export const notificationService = new NotificationService();
export default notificationService;

/*

import apiClient, { handleApiError } from './api.client';
import { API_ENDPOINTS } from '../config/api.config';
import { NotificationDto } from '../types/api.types';

class NotificationService {
  /**
   * Get all notifications for current user
   *//*
  async getNotifications(): Promise<NotificationDto[]> {
    try {
      const response = await apiClient.get<NotificationDto[]>(
        API_ENDPOINTS.NOTIFICATIONS.GET_ALL
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get unread notifications
   *//*
  async getUnreadNotifications(): Promise<NotificationDto[]> {
    try {
      const response = await apiClient.get<NotificationDto[]>(
        API_ENDPOINTS.NOTIFICATIONS.GET_UNREAD
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Mark notification as read
   *//*
  async markAsRead(id: string): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Mark all notifications as read
   *//*
  async markAllAsRead(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete notification
   *//*
  async deleteNotification(id: string): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE(id));
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;*/
