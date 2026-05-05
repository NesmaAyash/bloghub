import { useState, useEffect } from 'react';
import apiClient from '../services/api.client';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';
import { UserAvatar } from '../components/UserAvatar';
import { 
  CheckCircle, 
  Eye,
  Trash2,
  MessageCircle,
  Clock,
  ArrowLeft,
  FileText
} from 'lucide-react';

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  authorId: number;
  authorName: string;
  authorAvatar: string;
  postId: number;
  postTitle: string;
}

interface ContentModerationPageProps {
  onNavigate: (page: string, id?: any) => void;
}

export function ContentModerationPage({ onNavigate }: ContentModerationPageProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/Comment/all');
      setComments(response.data.comments || []);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to load comments';
      toast.error(message);
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      return;
    }
    
    try {
      setDeletingId(id);
      await apiClient.delete(`/Comment/admin/${id}`);
      setComments(comments.filter(c => c.id !== id));
      toast.success('Comment deleted successfully');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to delete comment';
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter comments based on search
  const filteredComments = comments.filter(c =>
    c.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.postTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group by post for stats
  const postsCount = new Set(comments.map(c => c.postId)).size;
  const authorsCount = new Set(comments.map(c => c.authorId)).size;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Button
            variant="ghost"
            onClick={() => onNavigate('admin-dashboard')}
            className="mb-4 -ml-2 hover:bg-muted/80"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="mb-2">Comments Moderation</h1>
          <p className="text-muted-foreground">
            Review and manage user comments across all articles
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Comments</p>
                  <p className="text-2xl font-bold">{comments.length}</p>
                </div>
                <MessageCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Articles with Comments</p>
                  <p className="text-2xl font-bold">{postsCount}</p>
                </div>
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Commenters</p>
                  <p className="text-2xl font-bold">{authorsCount}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <input
              type="text"
              placeholder="Search by content, author, or article title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {searchTerm && (
              <p className="text-sm text-muted-foreground mt-2">
                Showing {filteredComments.length} of {comments.length} comments
              </p>
            )}
          </CardContent>
        </Card>

        {/* Comments List */}
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <CardHeader>
            <CardTitle>All Comments ({filteredComments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading comments...</p>
              </div>
            ) : filteredComments.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {searchTerm ? 'No comments match your search' : 'No comments yet'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredComments.map((comment, index) => (
                  <div
                    key={comment.id}
                    className="animate-in fade-in slide-in-from-left-2 duration-500"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <UserAvatar 
                            name={comment.authorName} 
                            avatar={comment.authorAvatar} 
                            size="md" 
                          />

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {/* Header: Author + Article + Date */}
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-medium">{comment.authorName}</span>
                                  <span className="text-xs text-muted-foreground">on</span>
                                  <Badge 
                                    variant="outline" 
                                    className="cursor-pointer hover:bg-muted"
                                    onClick={() => onNavigate('article', comment.postId)}
                                  >
                                    {comment.postTitle}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatDate(comment.createdAt)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Comment Content */}
                            <p className="text-sm mb-3 break-words">{comment.content}</p>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onNavigate('article', comment.postId)}
                                className="gap-2"
                              >
                                <Eye className="h-3 w-3" />
                                View Article
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(comment.id)}
                                disabled={deletingId === comment.id}
                                className="gap-2"
                              >
                                <Trash2 className="h-3 w-3" />
                                {deletingId === comment.id ? 'Deleting...' : 'Delete'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}