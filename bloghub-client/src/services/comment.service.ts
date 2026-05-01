/**
 * Comment Service
 * 
 * Handles all comment-related API calls
 */

import apiClient, { handleApiError } from './api.client';
import { API_ENDPOINTS } from '../config/api.config';
import {
  CommentDto,
  CreateCommentRequest,
  UpdateCommentRequest,
} from '../types/api.types';

class CommentService {
  /**
   * Get comments for an article
   */
async getCommentsByArticle(articleId: string): Promise<any[]> {
  try {
    const response = await apiClient.get(
      API_ENDPOINTS.COMMENTS.GET_BY_ARTICLE(articleId)
    );
    // ✅ يدعم الحالتين
    return response.data.comments ?? response.data ?? [];
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}
  /**
   * Create new comment
   */
async createComment(postId: string, content: string): Promise<any> {
  try {
    const body = {
      postId: parseInt(postId),
      content: content,
    };
    
    console.log('Sending comment:', body); // ← مؤقتاً للتحقق
    
    const response = await apiClient.post('/Comment', body);
    return response.data.comment;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

  /**
   * Update comment
   */
  async updateComment(id: string, data: UpdateCommentRequest): Promise<CommentDto> {
    try {
      const response = await apiClient.put<CommentDto>(
        API_ENDPOINTS.COMMENTS.UPDATE(id),
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete comment
   */
  async deleteComment(id: string): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.COMMENTS.DELETE(id));
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

// Export singleton instance
export const commentService = new CommentService();
export default commentService;
