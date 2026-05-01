/**
 * Category Service
 * 
 * Handles all category-related API calls
 */



import apiClient, { handleApiError } from './api.client';

class CategoryService {

  // ✅ GET /api/Category
  async getCategories(): Promise<any[]> {
    try {
      const response = await apiClient.get('/Category');
      return response.data.categories ?? [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // ✅ POST /api/Category
  async createCategory(name: string, description?: string): Promise<any> {
    try {
      const response = await apiClient.post('/Category', {
        name,
        description,
      });
      return response.data.category;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // ✅ DELETE /api/Category/{id}
  async deleteCategory(id: string): Promise<void> {
    try {
      await apiClient.delete(`/Category/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const categoryService = new CategoryService();
export default categoryService;

/*
import apiClient, { handleApiError } from './api.client';
import { API_ENDPOINTS } from '../config/api.config';
import {
  CategoryDto,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../types/api.types';

class CategoryService {
  /**
   * Get all categories
   *//*
  async getCategories(): Promise<CategoryDto[]> {
    try {
      const response = await apiClient.get<CategoryDto[]>(
        API_ENDPOINTS.CATEGORIES.GET_ALL
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
*/
  /**
   * Get category by ID
   *//*
  async getCategoryById(id: string): Promise<CategoryDto> {
    try {
      const response = await apiClient.get<CategoryDto>(
        API_ENDPOINTS.CATEGORIES.GET_BY_ID(id)
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
*/
  /**
   * Get category by slug
   *//*
  async getCategoryBySlug(slug: string): Promise<CategoryDto> {
    try {
      const response = await apiClient.get<CategoryDto>(
        API_ENDPOINTS.CATEGORIES.GET_BY_SLUG(slug)
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }*/

  /**
   * Create new category (Admin only)
   *//*
  async createCategory(data: CreateCategoryRequest): Promise<CategoryDto> {
    try {
      const response = await apiClient.post<CategoryDto>(
        API_ENDPOINTS.CATEGORIES.CREATE,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
*/
  /**
   * Update category (Admin only)
   *//*
  async updateCategory(id: string, data: UpdateCategoryRequest): Promise<CategoryDto> {
    try {
      const response = await apiClient.put<CategoryDto>(
        API_ENDPOINTS.CATEGORIES.UPDATE(id),
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete category (Admin only)
   *//*
  async deleteCategory(id: string): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.CATEGORIES.DELETE(id));
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

// Export singleton instance
export const categoryService = new CategoryService();
export default categoryService;
*/