/**
 * Authentication Service
 * 
 * Handles all authentication-related API calls including:
 * - Login
 * - Register
 * - Logout
 * - Token refresh
 * - Password management
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

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5016/api';

class AuthService {

  /**
   * Login user with email and password
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      // ✅ تحقّق إن الـ response valid
      if (!response.data || !response.data.token) {
        throw new Error('Login failed - invalid response');
      }

      const { token, refreshToken, ...userData } = response.data;

      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refreshToken || '');
      localStorage.setItem('user', JSON.stringify(userData));

      return response.data;
    } catch (error) {
      // ✅ ارمي الـ axios error كاملاً (مع response.data.message)
      throw error;
    }
  }

  /**
   * Register new user
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.AUTH.REGISTER,
        userData
      );

      // ✅ تحقّق إن الـ response valid (فيه token)
      // لو Backend رجّع 200 OK لكن بدون token (مستحيل لكن للأمان)
      if (!response.data || !response.data.token) {
        throw new Error('Registration failed - no token received');
      }

      const { token, refreshToken, ...userDataFromApi } = response.data;

      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refreshToken || '');
      localStorage.setItem('user', JSON.stringify(userDataFromApi));

      return response.data;
    } catch (error) {
      // ✅ ارمي الـ axios error كاملاً (مع response.data.message)
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      clearAuthData();
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<UserDto> {
    try {
      const response = await apiClient.get<UserDto>(API_ENDPOINTS.AUTH.ME);
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Change user password
   */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Refresh access token
   */
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

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('accessToken');
    return !!token;
  }

  /**
   * Get stored user from localStorage
   */
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