import { useState, useEffect } from 'react';
import apiClient from '../services/api.client';
import { articleService } from '../services/article.service';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { UserAvatar } from '../components/UserAvatar';import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../components/ui/select';
import { Search, Eye, Heart, MessageCircle, Calendar, FileText, ArrowLeft, Edit } from 'lucide-react';

interface UserArticlesPageProps {
  userId?: string;
  onNavigate: (page: string, articleId?: string) => void;
}

export function UserArticlesPage({ userId, onNavigate }: UserArticlesPageProps) {
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [userArticles, setUserArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'views' | 'likes'>('date');

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const userRes = await apiClient.get(`/Author/${userId}`);
        setUser(userRes.data);

        const allArticles = await articleService.getArticles();
        const filtered = allArticles.filter(
          (a: any) => String(a.authorId) === String(userId)
        );
        setUserArticles(filtered);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const isOwnProfile = currentUser && user && String(currentUser.id) === String(user.id);

  const filterAndSortArticles = () => {
    let filtered = [...userArticles];

    if (searchQuery.trim()) {
      filtered = filtered.filter(article =>
        article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    const sorted = [...filtered];
    switch (sortBy) {
      case 'views':
        sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'likes':
        sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        break;
      case 'date':
      default:
        sorted.sort((a, b) =>
          new Date(b.publishedAt || b.createdAt || 0).getTime() -
          new Date(a.publishedAt || a.createdAt || 0).getTime()
        );
    }
    return sorted;
  };

  const filteredArticles = filterAndSortArticles();

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  const getMemberSince = (dateString: string) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    if (date.getFullYear() < 2020) return 'Recently';
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const totalViews = userArticles.reduce((sum, a) => sum + (a.views || 0), 0);
  const totalLikes = userArticles.reduce((sum, a) => sum + (a.likes || 0), 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h3 className="mb-2">User not found</h3>
          <Button onClick={() => onNavigate('home')} className="mt-4">
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }
console.log('user.avatar value:', user.avatar, 'type:', typeof user.avatar);
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => onNavigate(currentUser?.role === 'admin' ? 'user-management' : 'home')}
          className="mb-6 -ml-2 hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {isOwnProfile && (
          <Card className="mb-6 border-primary/50 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">This is Your Public Profile</h3>
                    <p className="text-sm text-muted-foreground">This is how others see you</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => onNavigate('my-articles')} className="gap-2">
                    <Edit className="h-4 w-4" /> Manage Articles
                  </Button>
                  <Button onClick={() => onNavigate('profile')} className="gap-2">
                    <Edit className="h-4 w-4" /> Edit Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-8 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20"></div>
          <CardContent className="pt-0 -mt-16">
             <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
              <UserAvatar 
  name={user.name} 
  avatar={user.avatar} 
  size="xl" 
  className="border-4 border-background shadow-xl relative z-10"
/>

              <div className="flex-1 md:mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <h1>{user.name}</h1>
                  {user.role === 'admin' && <Badge>Admin</Badge>}
                </div>
                {user.bio && <p className="text-muted-foreground mb-4 max-w-2xl">{user.bio}</p>}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {getMemberSince(user.joinedAt)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 md:mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{userArticles.length}</div>
                  <div className="text-xs text-muted-foreground">Articles</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Views</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{totalLikes}</div>
                  <div className="text-xs text-muted-foreground">Likes</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="mb-1">Articles by {user.name}</h2>
            <p className="text-muted-foreground">{filteredArticles.length} articles</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Latest</SelectItem>
                  <SelectItem value="views">Most Views</SelectItem>
                  <SelectItem value="likes">Most Likes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {filteredArticles.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="mb-2">No articles found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try a different search' : "This user hasn't published any articles yet"}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <Card
                key={article.id}
                className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer"
                onClick={() => onNavigate('article', article.id)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={article.coverImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600'}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {article.category && (
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary" className="shadow-lg">{article.category}</Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                  <h3 className="mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" /> {article.views || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" /> {article.likes || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" /> {article.commentsCount || 0}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(article.publishedAt || article.createdAt)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}