import { useState, useEffect } from 'react';
import { articleService } from '../services/article.service';
import { useAuth } from '../contexts/AuthContext';
//import { mockArticles, mockNotifications } from '../data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { 
  PenSquare, 
  Eye, 
  Heart, 
  MessageCircle, 
  TrendingUp,
  FileText,
  Bell,
  Clock
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AuthorDashboardProps {
  onNavigate: (page: string, articleId?: string) => void;
}

export function AuthorDashboard({ onNavigate }: AuthorDashboardProps) {
  const { user } = useAuth();

  // Get user's articles
 // const userArticles = mockArticles.filter(a => a.authorId === user?.id || a.authorId === '1');
 // const publishedArticles = userArticles.filter(a => a.status === 'published');
 // const draftArticles = userArticles.filter(a => a.status === 'draft');

  // Calculate stats
 // const totalViews = userArticles.reduce((sum, a) => sum + a.views, 0);
  //const totalLikes = userArticles.reduce((sum, a) => sum + a.likes, 0);
  //const totalComments = userArticles.reduce((sum, a) => sum + a.commentsCount, 0);

  // ✅ بدله
const [userArticles, setUserArticles] = useState<any[]>([]);

useEffect(() => {
  const fetchArticles = async () => {
    if (!user) return;
    try {
      const all = await articleService.getArticles();
      const mine = all.filter(a => String(a.authorId) === String(user.id));
      setUserArticles(mine);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    }
  };
  fetchArticles();
}, [user]);

const publishedArticles = userArticles.filter(a => a.status === 'published');
const draftArticles = userArticles.filter(a => a.status === 'draft');
const totalViews = userArticles.reduce((sum, a) => sum + (a.views || 0), 0);
const totalLikes = userArticles.reduce((sum, a) => sum + (a.likes || 0), 0);
const totalComments = userArticles.reduce((sum, a) => sum + (a.commentsCount || 0), 0);




  // Recent notifications
 // const recentNotifications = mockNotifications.slice(0, 3);

  // Mock engagement data for chart
  
const engagementData = userArticles
  .slice(0, 7)
  .map(article => ({
    date: new Date(article.publishedAt).toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric' 
    }),
    views: article.views || 0,
    likes: article.likes || 0,
  }))
  .reverse();

  // ✅ Recent Activity من المقالات الحقيقية
const recentActivity = publishedArticles
  .slice(0, 3)
  .map(article => ({
    id: article.id,
    type: 'article',
    title: 'Article published',
    message: article.title,
    createdAt: article.publishedAt,
  }));

  // Article performance data
  /*
  const articlePerformanceData = publishedArticles.slice(0, 5).map(article => ({
    name: article.title.substring(0, 20) + '...',
    views: article.views,
    likes: article.likes,
  }));
  */

  // ✅ بدل mock data
const articlePerformanceData = publishedArticles.slice(0, 5).map(article => ({
  name: article.title.substring(0, 20) + '...',
  views: article.views || 0,
  likes: article.likes || 0,
}));

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="mb-2">Welcome back, {user?.name}!</h1>
              <p className="text-muted-foreground">Here's what's happening with your articles</p>
            </div>
            <Button onClick={() => onNavigate('create-article')} size="lg" className="gap-2">
              <PenSquare className="h-5 w-5" />
              Write New Article
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Articles
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{publishedArticles.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {draftArticles.length} drafts
              </p>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Views
              </CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +12% from last week
              </p>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Likes
              </CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLikes}</div>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +8% from last week
              </p>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-250">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Comments
              </CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalComments}</div>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +15% from last week
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Engagement Chart */}
          <Card className="lg:col-span-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <CardHeader>
              <CardTitle>Engagement Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="views" 
                    stackId="1" 
                    stroke="hsl(var(--chart-1))" 
                    fill="hsl(var(--chart-1))" 
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="likes" 
                    stackId="2" 
                    stroke="hsl(var(--chart-2))" 
                    fill="hsl(var(--chart-2))" 
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Notifications */}
          {/* Recent Notifications */}
<Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-350">
  <CardHeader className="flex flex-row items-center justify-between">
    <CardTitle>Recent Activity</CardTitle>
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onNavigate('my-articles')}
    >
      View All
    </Button>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      {recentActivity.length === 0 ? (
        <p className="text-center text-muted-foreground py-4">No activity yet</p>
      ) : (
        recentActivity.map((activity, index) => (
          <div
            key={activity.id}
            className="flex gap-3 animate-in fade-in slide-in-from-right-2 duration-500"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <FileText className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{activity.title}</p>
              <p className="text-xs text-muted-foreground truncate">{activity.message}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3" />
                {formatDate(activity.createdAt)}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  </CardContent>
</Card>
        </div>

        {/* Article Performance */}
        <Card className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
          <CardHeader>
            <CardTitle>Article Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={articlePerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill="hsl(var(--chart-1))" />
                <Bar dataKey="likes" fill="hsl(var(--chart-2))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Articles */}
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-450">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your Recent Articles</CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onNavigate('my-articles')}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {publishedArticles.slice(0, 5).map((article, index) => (
                <div 
                  key={article.id}
                  className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer animate-in fade-in slide-in-from-left-2 duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => onNavigate('article', article.id)}
                >
                  <img 
                    src={article.coverImage} 
                    alt={article.title}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="mb-1 truncate">{article.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {article.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {article.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {article.commentsCount}
                      </span>
                    </div>
                  </div>
                  <Badge>{article.category}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
