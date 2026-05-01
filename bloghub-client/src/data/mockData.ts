export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  publishedAt: string;
  category: string;
  tags: string[];
  views: number;
  likes: number;
  commentsCount: number;
  status: 'draft' | 'published';
  featured?: boolean;
}

export interface Comment {
  id: string;
  articleId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  replies?: Comment[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  articlesCount: number;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'report' | 'system';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  articleId?: string;
}

export interface Report {
  id: string;
  contentType: 'article' | 'comment';
  contentId: string;
  reportedBy: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
}

export const mockCategories: Category[] = [
  { id: '1', name: 'Technology', slug: 'technology', articlesCount: 42 },
  { id: '2', name: 'Design', slug: 'design', articlesCount: 38 },
  { id: '3', name: 'Business', slug: 'business', articlesCount: 27 },
  { id: '4', name: 'Science', slug: 'science', articlesCount: 31 },
  { id: '5', name: 'Lifestyle', slug: 'lifestyle', articlesCount: 45 },
  { id: '6', name: 'Travel', slug: 'travel', articlesCount: 22 },
];

export const mockArticles: Article[] = [
  {
    id: '1',
    title: 'The Future of Web Development in 2026',
    excerpt: 'Exploring the latest trends and technologies shaping the future of web development.',
    content: `<p>Web development continues to evolve at a rapid pace. In 2026, we're seeing incredible advancements in framework capabilities, AI-assisted coding, and performance optimization.</p>
    
    <h2>Key Trends</h2>
    <p>Server components are now mainstream, edge computing is everywhere, and TypeScript has become the default choice for serious projects.</p>
    
    <h2>What This Means for Developers</h2>
    <p>Developers need to stay adaptable and continuously learn. The tools we use today will be different tomorrow, but the fundamentals of good software engineering remain constant.</p>`,
    coverImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop',
    authorId: '1',
    authorName: 'Sarah Chen',
   // authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    publishedAt: '2026-01-20T10:00:00Z',
    category: 'Technology',
    tags: ['Web Development', 'JavaScript', 'Trends'],
    views: 1243,
    likes: 89,
    commentsCount: 23,
    status: 'published',
    featured: true,
  },
  {
    id: '2',
    title: 'Mastering Modern UI/UX Design Principles',
    excerpt: 'A comprehensive guide to creating beautiful and functional user interfaces.',
    content: `<p>Great design is invisible. It guides users naturally through their journey without drawing attention to itself.</p>
    
    <h2>Core Principles</h2>
    <p>Consistency, clarity, and user feedback are the cornerstones of excellent UI/UX design. Every element should serve a purpose.</p>`,
    coverImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=400&fit=crop',
    authorId: '2',
    authorName: 'Michael Torres',
   // authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael',
    publishedAt: '2026-01-18T14:30:00Z',
    category: 'Design',
    tags: ['UI/UX', 'Design', 'User Experience'],
    views: 987,
    likes: 67,
    commentsCount: 15,
    status: 'published',
    featured: true,
  },
  {
    id: '3',
    title: 'Building Scalable Microservices Architecture',
    excerpt: 'Learn how to design and implement microservices that scale with your business.',
    content: `<p>Microservices architecture has revolutionized how we build large-scale applications. By breaking down monolithic applications into smaller, independent services, we gain flexibility and scalability.</p>`,
    coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop',
    authorId: '1',
    authorName: 'Sarah Chen',
    //authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    publishedAt: '2026-01-15T09:00:00Z',
    category: 'Technology',
    tags: ['Architecture', 'Microservices', 'Backend'],
    views: 1456,
    likes: 102,
    commentsCount: 34,
    status: 'published',
  },
  {
    id: '4',
    title: 'The Art of Minimalist Design',
    excerpt: 'Sometimes less is more. Discover the power of minimalism in modern design.',
    content: `<p>Minimalism isn't about removing everything - it's about keeping only what matters. Every element that remains must earn its place.</p>`,
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=400&fit=crop',
    authorId: '3',
    authorName: 'Emma Wilson',
   // authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
    publishedAt: '2026-01-12T16:00:00Z',
    category: 'Design',
    tags: ['Minimalism', 'Design Philosophy'],
    views: 756,
    likes: 54,
    commentsCount: 12,
    status: 'published',
  },
  {
    id: '5',
    title: 'Remote Work: The New Normal',
    excerpt: 'How remote work is reshaping the business landscape and company culture.',
    content: `<p>The shift to remote work has fundamentally changed how companies operate. What started as a necessity has become a preference for many.</p>`,
    coverImage: 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=800&h=400&fit=crop',
    authorId: '4',
    authorName: 'David Kim',
   // authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
    publishedAt: '2026-01-10T11:00:00Z',
    category: 'Business',
    tags: ['Remote Work', 'Culture', 'Future of Work'],
    views: 2341,
    likes: 156,
    commentsCount: 67,
    status: 'published',
    featured: true,
  },
  {
    id: '6',
    title: 'Understanding Quantum Computing',
    excerpt: 'An introduction to the fascinating world of quantum computing and its potential.',
    content: `<p>Quantum computing represents a paradigm shift in how we process information. Unlike classical computers that use bits, quantum computers use qubits.</p>`,
    coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=400&fit=crop',
    authorId: '5',
    authorName: 'Dr. Lisa Park',
 //   authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa',
    publishedAt: '2026-01-08T13:00:00Z',
    category: 'Science',
    tags: ['Quantum Computing', 'Technology', 'Future'],
    views: 1876,
    likes: 134,
    commentsCount: 45,
    status: 'published',
  },
];

export const mockComments: Comment[] = [
  {
    id: '1',
    articleId: '1',
    authorId: '3',
    authorName: 'Emma Wilson',
    //authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
    content: 'Great insights! I especially loved the section on TypeScript adoption.',
    createdAt: '2026-01-21T08:30:00Z',
  },
  {
    id: '2',
    articleId: '1',
    authorId: '4',
    authorName: 'David Kim',
  //  authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
    content: 'This is exactly what I needed to read today. Thank you for sharing!',
    createdAt: '2026-01-21T10:15:00Z',
  },
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'like',
    title: 'New Like',
    message: 'Someone liked your article "The Future of Web Development in 2026"',
    createdAt: '2026-01-24T09:00:00Z',
    read: false,
    articleId: '1',
  },
  {
    id: '2',
    type: 'comment',
    title: 'New Comment',
    message: 'Emma Wilson commented on your article',
    createdAt: '2026-01-23T14:30:00Z',
    read: false,
    articleId: '1',
  },
  {
    id: '3',
    type: 'system',
    title: 'Welcome!',
    message: 'Welcome to the blogging platform. Start creating amazing content!',
    createdAt: '2026-01-22T10:00:00Z',
    read: true,
  },
];

export const mockReports: Report[] = [
  {
    id: '1',
    contentType: 'article',
    contentId: '3',
    reportedBy: 'user_123',
    reason: 'Inappropriate content',
    status: 'pending',
    createdAt: '2026-01-23T16:00:00Z',
  },
  {
    id: '2',
    contentType: 'comment',
    contentId: '5',
    reportedBy: 'user_456',
    reason: 'Spam',
    status: 'reviewed',
    createdAt: '2026-01-22T11:00:00Z',
  },
];

export const mockUsers = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    role: 'author',
   // avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    joinedAt: '2025-06-15',
    articlesCount: 12,
    status: 'active',
  },
  {
    id: '2',
    name: 'Michael Torres',
    email: 'michael@example.com',
    role: 'author',
 //   avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael',
    joinedAt: '2025-07-20',
    articlesCount: 8,
    status: 'active',
  },
  {
    id: '3',
    name: 'Emma Wilson',
    email: 'emma@example.com',
    role: 'author',
  //  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
    joinedAt: '2025-08-10',
    articlesCount: 15,
    status: 'active',
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'david@example.com',
    role: 'author',
    //avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
    joinedAt: '2025-09-05',
    articlesCount: 6,
    status: 'active',
  },
  {
    id: '5',
    name: 'Dr. Lisa Park',
    email: 'lisa@example.com',
    role: 'author',
 //   avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa',
    joinedAt: '2025-05-01',
    articlesCount: 20,
    status: 'active',
  },
];
