/**
 * User Service
 * 
 * Handles all user-related API calls
 */

import apiClient, { handleApiError } from './api.client';
import { API_ENDPOINTS } from '../config/api.config';
import {
  UserDto,
  UpdateProfileRequest,
  UserStatsDto,
  PagedResult,
} from '../types/api.types';

class UserService {
  /**
   * Get all users (Admin only)
   */
  async getUsers(page = 1, pageSize = 10): Promise<PagedResult<UserDto>> {
    try {
      const response = await apiClient.get<PagedResult<UserDto>>(
        API_ENDPOINTS.USERS.GET_ALL,
        { params: { page, pageSize } }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<UserDto> {
    try {
      const response = await apiClient.get<UserDto>(
        API_ENDPOINTS.USERS.GET_BY_ID(id)
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(id: string, data: UpdateProfileRequest): Promise<UserDto> {
    try {
      const response = await apiClient.put<UserDto>(
        API_ENDPOINTS.USERS.UPDATE_PROFILE(id),
        data
      );
      
      // Update stored user data if updating own profile
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.id === id) {
          localStorage.setItem('user', JSON.stringify(response.data));
        }
      }
      
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update user avatar
   */
  async updateAvatar(id: string, avatarFile: File): Promise<UserDto> {
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      
      const response = await apiClient.post<UserDto>(
        API_ENDPOINTS.USERS.UPDATE_AVATAR(id),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      // Update stored user data if updating own avatar
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.id === id) {
          localStorage.setItem('user', JSON.stringify(response.data));
        }
      }
      
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Suspend user (Admin only)
   */
  async suspendUser(id: string): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.USERS.SUSPEND(id));
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Activate user (Admin only)
   */
  async activateUser(id: string): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.USERS.ACTIVATE(id));
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete user (Admin only)
   */
  async deleteUser(id: string): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.USERS.DELETE(id));
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(id: string): Promise<UserStatsDto> {
    try {
      const response = await apiClient.get<UserStatsDto>(
        API_ENDPOINTS.USERS.STATS(id)
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

// Export singleton instance
export const userService = new UserService();
export default userService;
