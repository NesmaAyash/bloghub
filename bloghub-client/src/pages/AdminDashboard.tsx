import { useState, useEffect } from 'react';
import { articleService } from '../services/article.service';
import { categoryService } from '../services/category.service';
import apiClient from '../services/api.client';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Users, FileText, MessageCircle, AlertTriangle, TrendingUp, Eye, Heart, PenSquare } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { UserAvatar } from '../components/UserAvatar';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [stats, setStats] = useState({ totalUsers: 0, totalArticles: 0, totalComments: 0, pendingReports: 0 });
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await apiClient.get('/Author/stats');
        setStats(statsRes.data);

        const articles = await articleService.getArticles();
        setRecentArticles(articles.slice(0, 5));

        const usersRes = await apiClient.get('/Author/all');
        setRecentUsers(usersRes.data.authors.slice(0, 5));

        const cats = await categoryService.getCategories();
        setCategoryData(cats.map((c: any) => ({
          name: c.name,
          value: articles.filter((a: any) => a.category === c.name).length
        })));
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const activityData = [
    { date: 'Week 1', users: 0, articles: 0 },
    { date: 'Week 2', users: 0, articles: 0 },
    { date: 'Week 3', users: stats.totalUsers, articles: stats.totalArticles },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
  <div>
    <h1 className="mb-2">Admin Dashboard</h1>
    <p className="text-muted-foreground">Manage and monitor your blogging platform</p>
  </div>
  <Button 
    variant="outline" 
    onClick={() => onNavigate('author-dashboard')}
    className="gap-2"
  >
    <PenSquare className="h-4 w-4" />
    My Author Dashboard
  </Button>
</div>
        

    {/* Stats Cards */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
  <Card 
    className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300" 
    onClick={() => onNavigate('user-management')}
  >
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
      <Users className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{stats.totalUsers}</div>
      <p className="text-xs text-muted-foreground mt-1">Click to manage →</p>
    </CardContent>
  </Card>

  <Card 
    className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300" 
    onClick={() => onNavigate('articles')}
  >
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">Total Articles</CardTitle>
      <FileText className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{stats.totalArticles}</div>
      <p className="text-xs text-muted-foreground mt-1">Click to view →</p>
    </CardContent>
  </Card>

  <Card 
    className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300" 
    onClick={() => onNavigate('content-moderation')}
  >
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">Total Comments</CardTitle>
      <MessageCircle className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{stats.totalComments}</div>
      <p className="text-xs text-muted-foreground mt-1">Click to moderate →</p>
    </CardContent>
  </Card>
</div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Platform Activity</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Users" />
                  <Line type="monotone" dataKey="articles" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Articles" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Categories</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Articles</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('content-moderation')}>View All</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentArticles.map((article, index) => (
                  <div key={article.id} className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <img src={article.coverImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=100'} alt={article.title} className="w-16 h-16 rounded-md object-cover" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">{article.title}</h4>
                      <p className="text-xs text-muted-foreground">by {article.authorName}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{article.views || 0}</span>
                        <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{article.likes || 0}</span>
                      </div>
                    </div>
                    <Badge variant="secondary">{article.category || 'General'}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Users</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('user-management')}>View All</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUsers.map((user, index) => (
                  <div key={user.id} className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                   <UserAvatar name={user.name} avatar={user.avatar} size="md" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">{user.name}</h4>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">{user.articlesCount} articles</p>
                    </div>
                    <Badge variant="default">active</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}