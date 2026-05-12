/**
 * Authentication Service
 */

import apiClient, { handleApiError, clearAuthData } from './api.client';
import { API_ENDPOINTS } from '../config/api.config';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UserDto,
  ChangePasswordRequest,
} from '../types/api.types';

class AuthService {

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      if (!response.data || !response.data.token) {
        throw new Error('Login failed - invalid response');
      }

      const { token, refreshToken, ...userData } = response.data;
      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refreshToken || '');
      localStorage.setItem('user', JSON.stringify(userData));

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.AUTH.REGISTER,
        userData
      );

      if (!response.data || !response.data.token) {
        throw new Error('Registration failed - no token received');
      }

      const { token, refreshToken, ...userDataFromApi } = response.data;
      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refreshToken || '');
      localStorage.setItem('user', JSON.stringify(userDataFromApi));

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      clearAuthData();
    }
  }

  async getCurrentUser(): Promise<UserDto> {
    try {
      const response = await apiClient.get<UserDto>(API_ENDPOINTS.AUTH.ME);
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
    } catch (error) {
      throw error;
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.AUTH.REFRESH_TOKEN,
        { refreshToken }
      );

      const { token, refreshToken: newRefreshToken, ...userData } = response.data;
      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', newRefreshToken || '');
      localStorage.setItem('user', JSON.stringify(userData));

      return response.data;
    } catch (error) {
      clearAuthData();
      throw error;
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  getStoredUser(): UserDto | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }
}

export const authService = new AuthService();
export default authService;
