/**
 * API Configuration
 * 
 * This file contains the base configuration for API calls to your ASP.NET Core backend.
 * Update the API_BASE_URL based on your environment.
 */

// API Base URL - Update this based on your environment
// For now, using a default fallback. Create a .env file with VITE_API_URL to override
export const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5016/api';

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/Author/Login',
    REGISTER: '/Author/Register',
    LOGOUT: '/Author/Logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    ME: '/auth/me',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  
  // Articles
  ARTICLES: {
    BASE: '/Post',
    GET_ALL: '/Post',
    GET_BY_ID: (id: string) => `/Post/${id}`,
    CREATE: '/Post',
    UPDATE: (id: string) => `/Post/${id}`,
    DELETE: (id: string) => `/Post/${id}`,
    PUBLISH: (id: string) => `/Post/${id}/publish`,
    UNPUBLISH: (id: string) => `/Post/${id}/unpublish`,
    LIKE: (id: string) => `/Post/${id}/like`,
    UNLIKE: (id: string) => `/Post/${id}/unlike`,
    BY_AUTHOR: (authorId: string) => `/Post/author/${authorId}`,
    BY_CATEGORY: (categorySlug: string) => `/Post/category/${categorySlug}`,
    FEATURED: '/Post/featured',
    SEARCH: (text: string) => `/Post/Search/${text}`,

  },
  
  // Comments
  COMMENTS: {
  GET_BY_ARTICLE: (articleId: string) => `/Comment/Post/${articleId}`,
  CREATE: '/Comment',
  DELETE: (id: string) => `/Comment/${id}`,
  UPDATE: (id: string) => `/Comment/${id}`,
},
  
  // Users
  USERS: {
    BASE: '/Author',
    GET_ALL: '/users',
    GET_BY_ID: (id: string) => `/Author/${id}`,
  UPDATE_PROFILE: (id: string) => `/Author/${id}`,
    UPDATE_AVATAR: (id: string) => `/Author/${id}/avatar`,
    SUSPEND: (id: string) => `/Author/${id}/suspend`,
    ACTIVATE: (id: string) => `/Author/${id}/activate`,
    DELETE: (id: string) => `/Author/${id}`,
    STATS: (id: string) => `/Author/${id}/stats`,
  },
  
  // Categories
  CATEGORIES: {
    BASE: '/categories',
    GET_ALL: '/categories',
    GET_BY_ID: (id: string) => `/categories/${id}`,
    GET_BY_SLUG: (slug: string) => `/categories/slug/${slug}`,
    CREATE: '/categories',
    UPDATE: (id: string) => `/categories/${id}`,
    DELETE: (id: string) => `/categories/${id}`,
  },
  
  // Notifications
  NOTIFICATIONS: {
    BASE: '/Notification',
    GET_ALL: '/Notification',
    GET_UNREAD: '/Notification/unread',
    MARK_READ: (id: string) => `/Notification/${id}/read`,
    MARK_ALL_READ: '/Notification/mark-all-read',
    DELETE: (id: string) => `/Notification/${id}`,
  },
  
  // Reports (Admin)
  REPORTS: {
    BASE: '/reports',
    GET_ALL: '/reports',
    GET_BY_ID: (id: string) => `/reports/${id}`,
    CREATE: '/reports',
    RESOLVE: (id: string) => `/reports/${id}/resolve`,
    REJECT: (id: string) => `/reports/${id}/reject`,
  },
  
  // Admin/Dashboard
  ADMIN: {
    STATS: '/admin/stats',
    ANALYTICS: '/admin/analytics',
  },
};

// API Response status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// API Error Messages
export const API_ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized. Please login again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Something went wrong on the server. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  DEFAULT: 'An unexpected error occurred.',
};

// Request timeout (in milliseconds)
export const REQUEST_TIMEOUT = 30000; // 30 seconds
