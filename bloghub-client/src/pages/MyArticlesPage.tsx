import { useState, useEffect } from 'react';
import { articleService } from '../services/article.service';
import { mockArticles } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { Search, Eye, Heart, MessageCircle, Edit, Trash2, MoreVertical, FileText } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

interface MyArticlesPageProps {
  onNavigate: (page: string, articleId?: string) => void;
}

export function MyArticlesPage({ onNavigate }: MyArticlesPageProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'views' | 'likes'>('date');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null);

  // Filter user's articles
  //const userArticles = mockArticles.filter(a => a.authorId === user?.id || a.authorId === '1');
  //const publishedArticles = userArticles.filter(a => a.status === 'published');
  //const draftArticles = userArticles.filter(a => a.status === 'draft');

  // ✅ بدله
const [userArticles, setUserArticles] = useState<any[]>([]);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  const fetchArticles = async () => {
    if (!user) return;
    try {
      const all = await articleService.getArticles();
      const mine = all.filter(a => String(a.authorId) === String(user.id));
      setUserArticles(mine);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setIsLoading(false);
    }
  };
  fetchArticles();
}, [user]);

const publishedArticles = userArticles.filter(a => a.status === 'published');
const draftArticles = userArticles.filter(a => a.status === 'draft');



  const filterAndSortArticles = (articles: typeof mockArticles) => {
    let filtered = articles;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    const sorted = [...filtered];
    switch (sortBy) {
      case 'views':
        sorted.sort((a, b) => b.views - a.views);
        break;
      case 'likes':
        sorted.sort((a, b) => b.likes - a.likes);
        break;
      case 'date':
      default:
        sorted.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    }

    return sorted;
  };

  const handleDelete = (articleId: string) => {
    setArticleToDelete(articleId);
    setDeleteDialogOpen(true);
  };
/*
  const confirmDelete = () => {
    toast.success('Article deleted successfully!');
    setDeleteDialogOpen(false);
    setArticleToDelete(null);
  };*/
  const confirmDelete = async () => {
  if (!articleToDelete) return;
  try {
    await articleService.deleteArticle(articleToDelete);
    setUserArticles(prev => prev.filter(a => String(a.id) !== articleToDelete));
    toast.success('Article deleted successfully!');
  } catch (error) {
    toast.error('Failed to delete article');
  } finally {
    setDeleteDialogOpen(false);
    setArticleToDelete(null);
  }
};

  const handleEdit = (articleId: string) => {
    onNavigate('create-article', articleId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // في MyArticlesPage و AuthorDashboard
const fetchArticles = async () => {
  if (!user) return;
  try {
    const all = await articleService.getArticles(); // ← هيرجع array مباشرة
    const mine = all.filter(a => String(a.authorId) === String(user.id));
    setUserArticles(mine);
  } catch (error) {
    console.error('Failed to fetch articles:', error);
  }
};

  const ArticleList = ({ articles }: { articles: typeof mockArticles }) => {
    const filteredArticles = filterAndSortArticles(articles);

    if (filteredArticles.length === 0) {
      return (
        <Card className="p-12 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="mb-2">No articles found</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery ? 'Try adjusting your search query' : 'Start writing your first article'}
          </p>
          {!searchQuery && (
            <Button onClick={() => onNavigate('create-article')}>
              Create Article
            </Button>
          )}
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {filteredArticles.map((article, index) => (
          <Card 
            key={article.id}
            className="overflow-hidden hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="p-0">
              <div className="grid md:grid-cols-[200px_1fr] gap-0">
                {/* Thumbnail */}
                <div 
                  className="h-48 md:h-full overflow-hidden cursor-pointer"
                  onClick={() => onNavigate('article', article.id)}
                >
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{article.category}</Badge>
                        {article.status === 'draft' && (
                          <Badge variant="outline">Draft</Badge>
                        )}
                      </div>
                      <h3 
                        className="mb-2 cursor-pointer hover:text-primary transition-colors line-clamp-1"
                        onClick={() => onNavigate('article', article.id)}
                      >
                        {article.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {article.excerpt}
                      </p>
                    </div>

                    {/* Actions Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onNavigate('article', article.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(article.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(article.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between">
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
                    <span className="text-xs text-muted-foreground">
                      {formatDate(article.publishedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div>
            <h1 className="mb-2">My Articles</h1>
            <p className="text-muted-foreground">
              {publishedArticles.length} published, {draftArticles.length} drafts
            </p>
          </div>
          <Button onClick={() => onNavigate('create-article')} size="lg">
            Create Article
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search your articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
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

        {/* Tabs */}
        <Tabs defaultValue="published" className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
          <TabsList className="mb-6">
            <TabsTrigger value="published">
              Published ({publishedArticles.length})
            </TabsTrigger>
            <TabsTrigger value="drafts">
              Drafts ({draftArticles.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="published">
            <ArticleList articles={publishedArticles} />
          </TabsContent>

          <TabsContent value="drafts">
            <ArticleList articles={draftArticles} />
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your article.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
