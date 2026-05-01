/**
 * Article Service
 * 
 * Handles all article-related API calls
 */

import apiClient, { handleApiError } from './api.client';
import { API_ENDPOINTS } from '../config/api.config';

import {
  ArticleDto,
  CreateArticleRequest,
  UpdateArticleRequest,
  ArticleListQuery,
  PagedResult,
} from '../types/api.types';

class ArticleService {
  /**
   * Get all articles with optional filters
   */
  /*async getArticles(query?: ArticleListQuery): Promise<PagedResult<ArticleDto>> {
    try {
      const response = await apiClient.get<PagedResult<ArticleDto>>(
        API_ENDPOINTS.ARTICLES.GET_ALL,
        { params: query }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }*/

  async getArticles(): Promise<any[]> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.ARTICLES.GET_ALL);
    return response.data.posts ?? []; // ← لازم .posts
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

  /**
   * Get single article by ID
   */
  /*
  async getArticleById(id: string): Promise<ArticleDto> {
    try {
      const response = await apiClient.get<ArticleDto>(
        API_ENDPOINTS.ARTICLES.GET_BY_ID(id)
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
*/
/*async getArticleById(id: string): Promise<any> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.ARTICLES.GET_BY_ID(id));
    return response.data.Post; // ← Backend بيرجع { Post: {} }
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}*/

async getArticleById(id: string): Promise<any> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.ARTICLES.GET_BY_ID(id));
    return response.data.post ?? response.data.Post ?? null; // ✅ يدعم الحالتين
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}
  /**
   * Create new article
   */
  async createArticle(data: CreateArticleRequest): Promise<ArticleDto> {
    try {
      const response = await apiClient.post<ArticleDto>(
        API_ENDPOINTS.ARTICLES.CREATE,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update existing article
   */
async updateArticle(id: string, data: any): Promise<void> {
  try {
    await apiClient.put(API_ENDPOINTS.ARTICLES.UPDATE(id), data, {
      headers: { 'Content-Type': 'multipart/form-data' } // ← أضف هذا
    });
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

  /**
   * Delete article
   */
  async deleteArticle(id: string): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.ARTICLES.DELETE(id));
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Publish article
   */
  async publishArticle(id: string): Promise<ArticleDto> {
    try {
      const response = await apiClient.post<ArticleDto>(
        API_ENDPOINTS.ARTICLES.PUBLISH(id)
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Unpublish article (set to draft)
   */
  async unpublishArticle(id: string): Promise<ArticleDto> {
    try {
      const response = await apiClient.post<ArticleDto>(
        API_ENDPOINTS.ARTICLES.UNPUBLISH(id)
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Like article
   */

  async likeArticle(id: string): Promise<void> {
  try {
    await apiClient.post(`/Post/${id}/like`);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

async unlikeArticle(id: string): Promise<void> {
  try {
    await apiClient.post(`/Post/${id}/unlike`);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}
  /*
  async likeArticle(id: string): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.ARTICLES.LIKE(id));
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
*/
  /**
   * Unlike article
   *//*
  async unlikeArticle(id: string): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.ARTICLES.UNLIKE(id));
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }*/

  /**
   * Get articles by author
   */
  async getArticlesByAuthor(authorId: string, query?: ArticleListQuery): Promise<PagedResult<ArticleDto>> {
    try {
      const response = await apiClient.get<PagedResult<ArticleDto>>(
        API_ENDPOINTS.ARTICLES.BY_AUTHOR(authorId),
        { params: query }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get articles by category
   */
  async getArticlesByCategory(categorySlug: string, query?: ArticleListQuery): Promise<PagedResult<ArticleDto>> {
    try {
      const response = await apiClient.get<PagedResult<ArticleDto>>(
        API_ENDPOINTS.ARTICLES.BY_CATEGORY(categorySlug),
        { params: query }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get featured articles
   */
  async getFeaturedArticles(): Promise<ArticleDto[]> {
    try {
      const response = await apiClient.get<ArticleDto[]>(
        API_ENDPOINTS.ARTICLES.FEATURED
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Search articles
   */
  async searchArticles(searchQuery: string, query?: ArticleListQuery): Promise<PagedResult<ArticleDto>> {
    try {
      const response = await apiClient.get<PagedResult<ArticleDto>>(
        API_ENDPOINTS.ARTICLES.SEARCH,
        { params: { ...query, searchQuery } }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

// Export singleton instance
export const articleService = new ArticleService();
export default articleService;
