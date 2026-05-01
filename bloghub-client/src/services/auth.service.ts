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

      const { token, refreshToken, ...userData } = response.data;

      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
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

      const { token, refreshToken, ...userDataFromApi } = response.data;

      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userDataFromApi));

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
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
      localStorage.setItem('Author', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Change user password
   */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
    } catch (error) {
      throw new Error(handleApiError(error));
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
      localStorage.setItem('refreshToken', newRefreshToken);
      localStorage.setItem('Author', JSON.stringify(userData));

      return response.data;
    } catch (error) {
      clearAuthData();
      throw new Error(handleApiError(error));
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