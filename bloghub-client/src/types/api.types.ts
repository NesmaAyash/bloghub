/**
 * TypeScript Interfaces for API Data Models
 * 
 * These interfaces match the DTOs (Data Transfer Objects) from your ASP.NET Core backend.
 * Make sure these match your C# models.
 */

// ==================== AUTH MODELS ====================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/*export interface AuthResponse {
  token: string;
  refreshToken: string;
  Author: {      // تأكد من تطابق الاسم (Author) وحالة الأحرف
    id: number;
    firstName: string;
    email: string;}
  expiresAt: string;
}*/
export interface AuthResponse {
  token: string;
  refreshToken: string;
  id: number;      // يجب أن يكون رقم (number)
  name: string;    // الاسم يأتي مباشرة
  email: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ==================== USER MODELS ====================

/*export interface UserDto {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  role: 'Visitor' | 'Author' | 'Admin';
  status: 'Active' | 'Suspended' | 'Banned';
  createdAt: string;
  updatedAt?: string;
}
*/
export interface UserDto {
  id: number; // تغيير من string إلى number ليتطابق مع الـ API
  name: string;
  email: string;
  // بقية الخصائص اختيارية (?) لأن الـ API حالياً لا يرسلها كلها
  bio?: string;
  avatar?: string;
  role?: 'Visitor' | 'Author' | 'Admin';
  createdAt?: string;
}
export interface UpdateProfileRequest {
  name: string;
  email: string;
  bio?: string;
}

export interface UserStatsDto {
  totalArticles: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  followersCount: number;
  followingCount: number;
}

// ==================== ARTICLE MODELS ====================
/*
export interface ArticleDto {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  tags: string[];
  status: 'Draft' | 'Published';
  featured: boolean;
  views: number;
  likes: number;
  commentsCount: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt?: string;
}*/
export interface ArticleDto {
  id: number;
  title: string;
  content: string;
  authorId: number;
  authorName?: string; // قادم من Include(x => x.author)
}
export interface CreateArticleRequest {
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  category: string;
  tags: string[];
  authorId: string;
  status: 'draft' | 'published';
  featured: boolean;
}

export interface UpdateArticleRequest {
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  categoryId: string;
  tags: string[];
}

export interface ArticleListQuery {
  page?: number;
  pageSize?: number;
  categorySlug?: string;
  authorId?: string;
  searchQuery?: string;
  sortBy?: 'date' | 'views' | 'likes' | 'comments';
  sortOrder?: 'asc' | 'desc';
  status?: 'Draft' | 'Published';
  featured?: boolean;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ==================== COMMENT MODELS ====================

export interface CommentDto {
  id: string;
  articleId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  parentCommentId?: string;
  replies?: CommentDto[];
  createdAt: string;
  updatedAt?: string;
}

export interface CreateCommentRequest {
  articleId: string;
  content: string;
  parentCommentId?: string;
}

export interface UpdateCommentRequest {
  content: string;
}

// ==================== CATEGORY MODELS ====================

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  articlesCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateCategoryRequest {
  name: string;
  slug: string;
  description?: string;
}

export interface UpdateCategoryRequest {
  name: string;
  slug: string;
  description?: string;
}

// ==================== NOTIFICATION MODELS ====================

export interface NotificationDto {
  id: string;
  userId: string;
  type: 'Like' | 'Comment' | 'Report' | 'System';
  title: string;
  message: string;
  articleId?: string;
  read: boolean;
  createdAt: string;
}

// ==================== REPORT MODELS ====================

export interface ReportDto {
  id: string;
  contentType: 'Article' | 'Comment';
  contentId: string;
  reporterId: string;
  reporterName: string;
  reason: string;
  description?: string;
  status: 'Pending' | 'Resolved' | 'Rejected';
  moderatorId?: string;
  moderatorNote?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface CreateReportRequest {
  contentType: 'Article' | 'Comment';
  contentId: string;
  reason: string;
  description?: string;
}

export interface ResolveReportRequest {
  moderatorNote?: string;
}

// ==================== ADMIN/DASHBOARD MODELS ====================

export interface DashboardStatsDto {
  totalUsers: number;
  totalArticles: number;
  totalComments: number;
  pendingReports: number;
  newUsersThisMonth: number;
  newArticlesThisMonth: number;
  totalViews: number;
  totalLikes: number;
}

export interface AnalyticsDataDto {
  date: string;
  users: number;
  articles: number;
  views: number;
  comments: number;
}

// ==================== API ERROR RESPONSE ====================

export interface ApiErrorResponse {
  type: string;
  title: string;
  status: number;
  detail?: string;
  errors?: { [key: string]: string[] };
  traceId?: string;
}

// ==================== COMMON TYPES ====================

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}
