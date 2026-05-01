/**
 * Report/Admin Service
 * 
 * Handles all report and admin-related API calls
 */

import apiClient, { handleApiError } from './api.client';
import { API_ENDPOINTS } from '../config/api.config';
import {
  ReportDto,
  CreateReportRequest,
  ResolveReportRequest,
  DashboardStatsDto,
  AnalyticsDataDto,
  PagedResult,
} from '../types/api.types';

class AdminService {
  // ==================== REPORTS ====================

  /**
   * Get all reports (Admin only)
   */
  async getReports(page = 1, pageSize = 10): Promise<PagedResult<ReportDto>> {
    try {
      const response = await apiClient.get<PagedResult<ReportDto>>(
        API_ENDPOINTS.REPORTS.GET_ALL,
        { params: { page, pageSize } }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get report by ID (Admin only)
   */
  async getReportById(id: string): Promise<ReportDto> {
    try {
      const response = await apiClient.get<ReportDto>(
        API_ENDPOINTS.REPORTS.GET_BY_ID(id)
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create new report
   */
  async createReport(data: CreateReportRequest): Promise<ReportDto> {
    try {
      const response = await apiClient.post<ReportDto>(
        API_ENDPOINTS.REPORTS.CREATE,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Resolve report (Admin only)
   */
  async resolveReport(id: string, data: ResolveReportRequest): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.REPORTS.RESOLVE(id), data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Reject report (Admin only)
   */
  async rejectReport(id: string, data: ResolveReportRequest): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.REPORTS.REJECT(id), data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // ==================== DASHBOARD/ANALYTICS ====================

  /**
   * Get dashboard statistics (Admin only)
   */
  async getDashboardStats(): Promise<DashboardStatsDto> {
    try {
      const response = await apiClient.get<DashboardStatsDto>(
        API_ENDPOINTS.ADMIN.STATS
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get analytics data (Admin only)
   */
  async getAnalyticsData(startDate?: string, endDate?: string): Promise<AnalyticsDataDto[]> {
    try {
      const response = await apiClient.get<AnalyticsDataDto[]>(
        API_ENDPOINTS.ADMIN.ANALYTICS,
        { params: { startDate, endDate } }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

// Export singleton instance
export const adminService = new AdminService();
export default adminService;
