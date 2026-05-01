/**
 * HTTP Client Setup with Axios
 * 
 * This file sets up axios with interceptors for:
 * - Adding JWT tokens to requests
 * - Handling token refresh
 * - Global error handling
 * - Request/response logging (in development)
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL, API_ERROR_MESSAGES, HTTP_STATUS, REQUEST_TIMEOUT } from '../config/api.config';
import { ApiErrorResponse } from '../types/api.types';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== REQUEST INTERCEPTOR ====================

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    const token = localStorage.getItem('accessToken');
    
    // Add token to request headers if it exists
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==================== RESPONSE INTERCEPTOR ====================

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    
    return response;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });
          
          const { token, refreshToken: newRefreshToken } = response.data;
          
          // Save new tokens
          localStorage.setItem('accessToken', token);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed - logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Redirect to login
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      }
    }
    
    // Log error in development
    if (import.meta.env.DEV) {
      console.error('[API Error]', error.response?.data || error.message);
    }
    
    return Promise.reject(error);
  }
);

// ==================== ERROR HANDLER ====================

export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    
    // Network error
    if (!axiosError.response) {
      return API_ERROR_MESSAGES.NETWORK_ERROR;
    }
    
    // Handle different status codes
    switch (axiosError.response.status) {
      case HTTP_STATUS.UNAUTHORIZED:
        return API_ERROR_MESSAGES.UNAUTHORIZED;
      case HTTP_STATUS.FORBIDDEN:
        return API_ERROR_MESSAGES.FORBIDDEN;
      case HTTP_STATUS.NOT_FOUND:
        return API_ERROR_MESSAGES.NOT_FOUND;
      case HTTP_STATUS.BAD_REQUEST:
        // Return validation errors if available
        if (axiosError.response.data?.errors) {
          const errors = axiosError.response.data.errors;
          const firstError = Object.values(errors)[0];
          return Array.isArray(firstError) ? firstError[0] : API_ERROR_MESSAGES.VALIDATION_ERROR;
        }
        return axiosError.response.data?.detail || API_ERROR_MESSAGES.VALIDATION_ERROR;
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        return API_ERROR_MESSAGES.SERVER_ERROR;
      default:
        return axiosError.response.data?.detail || API_ERROR_MESSAGES.DEFAULT;
    }
  }
  
  // Non-axios error
  if (error instanceof Error) {
    return error.message;
  }
  
  return API_ERROR_MESSAGES.DEFAULT;
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('accessToken');
  return !!token;
};

/**
 * Get stored user data
 */
export const getStoredUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Clear auth data from storage
 */
export const clearAuthData = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

export default apiClient;
