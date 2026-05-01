import { useState, useEffect } from 'react';
import { articleService } from '../services/article.service';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Eye, Heart, MessageCircle, Share2, Facebook, Twitter, Linkedin, Link as LinkIcon, Clock, Tag, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { commentService } from '../services/comment.service';
import { UserAvatar } from '../components/UserAvatar';



interface ArticleDetailsPageProps {
  articleId?: string;
  onNavigate: (page: string, param?: string) => void;
}

export function ArticleDetailsPage({ articleId, onNavigate }: ArticleDetailsPageProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(() => {
  return localStorage.getItem(`liked_${articleId}`) === 'true';
});
  const [commentText, setCommentText] = useState('');
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [article, setArticle] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
const [isLiking, setIsLiking] = useState(false); // ← أضف

  const [comments, setComments] = useState<any[]>([]);
const [isLoadingComments, setIsLoadingComments] = useState(true);

useEffect(() => {
  const fetchComments = async () => {
    if (!articleId) return;
    try {
      const data = await commentService.getCommentsByArticle(articleId);
      setComments(data);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };
  fetchComments();
}, [articleId]);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!articleId) return;
      try {
        setIsLoading(true);
        const data = await articleService.getArticleById(articleId);
        setArticle(data);
      } catch (error) {
        console.error('Failed to fetch article:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticle();
  }, [articleId]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };
/*
  const handleLike = () => {
    if (!user) { onNavigate('login'); return; }
    setLiked(!liked);
    toast.success(liked ? 'Removed from likes' : 'Article liked!');
  };*/

const handleLike = async () => {
  if (!user) { onNavigate('login'); return; }
  if (isLiking) return;

  try {
    setIsLiking(true);
    if (liked) {
      // ✅ Unlike
      await articleService.unlikeArticle(articleId);
      setArticle((prev: any) => ({ ...prev, likes: Math.max(0, prev.likes - 1) }));
      setLiked(false);
      localStorage.removeItem(`liked_${articleId}`); // ← احذف من localStorage
      toast.success('Removed from likes');
    } else {
      // ✅ Like
      await articleService.likeArticle(articleId);
      setArticle((prev: any) => ({ ...prev, likes: prev.likes + 1 }));
      setLiked(true);
      localStorage.setItem(`liked_${articleId}`, 'true'); // ← احفظ في localStorage
      toast.success('Article liked!');
    }
  } catch (error) {
    toast.error('Failed to update like');
  } finally {
    setIsLiking(false);
  }
};

/*
  const handleComment = () => {
    if (!user) { onNavigate('login'); return; }
    if (!commentText.trim()) return;
    toast.success('Comment posted successfully!');
    setCommentText('');
  };
*/

const handleComment = async () => {
  if (!user) { onNavigate('login'); return; }
  if (!commentText.trim()) return;
  
  console.log('commentText:', commentText); // ← أضف هذا
  console.log('articleId:', articleId);     // ← وهذا
  
  try {
    const newComment = await commentService.createComment(articleId, commentText);
    setComments(prev => [newComment, ...prev]);
    setCommentText('');
    toast.success('Comment posted successfully!');
  } catch (error) {
    toast.error('Failed to post comment');
  }
};
  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = article?.title || '';
    let shareUrl = '';
    switch (platform) {
      case 'facebook': shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`; break;
      case 'twitter': shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`; break;
      case 'linkedin': shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`; break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
        return;
    }
    if (shareUrl) window.open(shareUrl, '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Loading article...</p>
    </div>
  );

  if (!article) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Article not found</p>
    </div>
  );

  // ✅ قيم افتراضية
  const coverImage = article.coverImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=400&fit=crop';
  const authorName = article.authorName || 'Unknown';
  const authorAvatar = article.authorAvatar || '';
  const tags = article.tags || [];
  //const articleComments: any[] = []; // ⏳ لاحقاً
  const readingTime = Math.ceil((article.content?.split(' ').length || 0) / 200);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Image */}
      <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden">
        <img src={coverImage} alt={article.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute top-4 left-4 z-20">
          <Button variant="secondary" onClick={() => onNavigate('home')}
            className="shadow-lg hover:shadow-xl transition-all animate-in fade-in slide-in-from-left-4 duration-500">
            <ArrowLeft className="h-4 w-4 mr-2" />Back
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <article className="max-w-4xl mx-auto">
          {/* Article Header */}
          <Card className="p-6 md:p-10 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <Badge>{article.category || 'General'}</Badge>
              {tags.map((tag: string) => (
                <Badge key={tag} variant="outline">
                  <Tag className="h-3 w-3 mr-1" />{tag}
                </Badge>
              ))}
            </div>

            <h1 className="mb-6">{article.title}</h1>

            <div className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b">
              <div className="flex items-center gap-4">
                <div
  className="cursor-pointer hover:ring-2 hover:ring-primary rounded-full transition-all"
  onClick={() => onNavigate('user-articles', article.authorId)}
>
  <UserAvatar name={authorName} avatar={authorAvatar} size="lg" />
</div>
                <div>
                  <p className="font-medium cursor-pointer hover:text-primary transition-colors"
                    onClick={() => onNavigate('user-articles', article.authorId)}>
                    {authorName}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />{formatDate(article.publishedAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />{readingTime} min read
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{article.views || 0}</span>
                <span className="flex items-center gap-1">
                  <Heart className={`h-4 w-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
                  {article.likes || 0}
                </span>
               
<span className="flex items-center gap-1">
  <MessageCircle className="h-4 w-4" />
  {comments.length} 
</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-6">
          <Button
  onClick={handleLike}
  variant={liked ? 'default' : 'outline'}
  className="gap-2"
  disabled={isLiking}
>
  <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
  {liked ? 'Liked ❤️' : 'Like'}
</Button>
              <div className="relative">
                <Button onClick={() => setShowShareMenu(!showShareMenu)} variant="outline" className="gap-2">
                  <Share2 className="h-4 w-4" />Share
                </Button>
                {showShareMenu && (
                  <Card className="absolute top-12 left-0 z-50 p-2 shadow-lg min-w-[200px] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="space-y-1">
                      <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => handleShare('facebook')}><Facebook className="h-4 w-4" />Facebook</Button>
                      <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => handleShare('twitter')}><Twitter className="h-4 w-4" />Twitter</Button>
                      <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => handleShare('linkedin')}><Linkedin className="h-4 w-4" />LinkedIn</Button>
                      <Separator />
                      <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => handleShare('copy')}><LinkIcon className="h-4 w-4" />Copy Link</Button>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </Card>

          {/* Article Body */}
          <Card className="p-6 md:p-10 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            <div className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: article.content || '' }} />
          </Card>

          {/* Comments Section */}
          {/* Comments Section */}
<Card className="p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
  <h2 className="mb-6">Comments ({comments.length})</h2>
  {user ? (
    <div className="mb-8">
      <div className="flex gap-4">
        <UserAvatar name={user.name} avatar={user.avatar} size="md" />
        <div className="flex-1">
          <Textarea placeholder="Share your thoughts..." value={commentText}
            onChange={(e) => setCommentText(e.target.value)} className="mb-3" rows={3} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCommentText('')}>Cancel</Button>
            <Button onClick={handleComment}>Post Comment</Button>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="mb-8 p-6 border rounded-lg text-center">
      <p className="text-muted-foreground mb-4">Sign in to join the conversation</p>
      <Button onClick={() => onNavigate('login')}>Sign In</Button>
    </div>
  )}

  <div className="space-y-6">
    {isLoadingComments ? (
      <p className="text-center text-muted-foreground">Loading comments...</p>
    ) : comments.length === 0 ? (
      <p className="text-center text-muted-foreground py-8">
        No comments yet. Be the first to comment!
      </p>
    ) : (
      comments.map((comment, index) => (
        <div key={comment.id}
          className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500"
          style={{ animationDelay: `${index * 100}ms` }}>
         <UserAvatar name={comment.authorName} avatar={comment.authorAvatar} size="md" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <p className="font-medium">{comment.authorName}</p>
              <span className="text-xs text-muted-foreground">
                {formatDate(comment.createdAt)}
              </span>
            </div>
            <p className="text-muted-foreground">{comment.content}</p>
            {user && String(user.id) === String(comment.authorId) && (
              <Button variant="ghost" size="sm" className="text-destructive mt-2"
                onClick={async () => {
                  await commentService.deleteComment(comment.id);
                  setComments(prev => prev.filter(c => c.id !== comment.id));
                  toast.success('Comment deleted');
                }}>
                Delete
              </Button>
            )}
          </div>
        </div>
      ))
    )}
  </div>
</Card>
        </article>
      </div>
    </div>
  );
}






/*import { useState, useEffect } from 'react';
//import { mockArticles, mockComments, Comment } from '../data/mockData';
import { articleService } from '../services/article.service';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Eye, Heart, MessageCircle, Share2, Facebook, Twitter, Linkedin, Link as LinkIcon, Clock, Tag, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';

interface ArticleDetailsPageProps {
  articleId?: string;
  onNavigate: (page: string, param?: string) => void;
}

export function ArticleDetailsPage({ articleId = '1', onNavigate }: ArticleDetailsPageProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showShareMenu, setShowShareMenu] = useState(false);

  //const article = mockArticles.find(a => a.id === articleId) || mockArticles[0];
  //const articleComments = mockComments.filter(c => c.articleId === article.id);
  

  // ✅ بدله
const [article, setArticle] = useState<any>(null);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  const fetchArticle = async () => {
    if (!articleId) return;
    try {
      setIsLoading(true);
      const data = await articleService.getArticleById(articleId);
      setArticle(data);
    } catch (error) {
      console.error('Failed to fetch article:', error);
    } finally {
      setIsLoading(false);
    }
  };
  fetchArticle();
}, [articleId]);

if (isLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Loading article...</p>
    </div>
  );
}

if (!article) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Article not found</p>
    </div>
  );
}

const readingTime = Math.ceil((article.content?.split(' ').length || 0) / 200);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const readingTime = Math.ceil(article.content.split(' ').length / 200);

  const handleLike = () => {
    if (!user) {
      onNavigate('login');
      return;
    }
    setLiked(!liked);
    toast.success(liked ? 'Removed from likes' : 'Article liked!');
  };

  const handleComment = () => {
    if (!user) {
      onNavigate('login');
      return;
    }
    if (!commentText.trim()) return;
    
    toast.success('Comment posted successfully!');
    setCommentText('');
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = article.title;
    
    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    setShowShareMenu(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Image *//*}
      <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden">
        <img
          src={article.coverImage}
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        {/* Back Button Overlay *//*}
        <div className="absolute top-4 left-4 z-20">
          <Button
            variant="secondary"
            onClick={() => onNavigate('home')}
            className="shadow-lg hover:shadow-xl transition-all animate-in fade-in slide-in-from-left-4 duration-500"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </div>

      {/* Article Content *//*}
      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <article className="max-w-4xl mx-auto">
          {/* Article Header *//*}
          <Card className="p-6 md:p-10 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <Badge>{article.category}</Badge>
              {article.tags.map(tag => (
                <Badge key={tag} variant="outline">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>

            <h1 className="mb-6">{article.title}</h1>

            {/* Author Info *//*}
            <div className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b">
              <div className="flex items-center gap-4">
                <Avatar 
                  className="h-14 w-14 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                  onClick={() => onNavigate('user-articles', article.authorId)}
                >
                  <AvatarImage src={article.authorAvatar} alt={article.authorName} />
                  <AvatarFallback>{article.authorName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p 
                    className="font-medium cursor-pointer hover:text-primary transition-colors"
                    onClick={() => onNavigate('user-articles', article.authorId)}
                  >
                    {article.authorName}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(article.publishedAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {readingTime} min read
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats *//*}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {article.views}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className={`h-4 w-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
                  {article.likes + (liked ? 1 : 0)}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  {article.commentsCount}
                </span>
              </div>
            </div>

            {/* Action Buttons *//*}
            <div className="flex items-center gap-3 pt-6">
              <Button
                onClick={handleLike}
                variant={liked ? 'default' : 'outline'}
                className="gap-2"
              >
                <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                {liked ? 'Liked' : 'Like'}
              </Button>
              <div className="relative">
                <Button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  variant="outline"
                  className="gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
                {showShareMenu && (
                  <Card className="absolute top-12 left-0 z-50 p-2 shadow-lg min-w-[200px] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="space-y-1">
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-2"
                        onClick={() => handleShare('facebook')}
                      >
                        <Facebook className="h-4 w-4" />
                        Facebook
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-2"
                        onClick={() => handleShare('twitter')}
                      >
                        <Twitter className="h-4 w-4" />
                        Twitter
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-2"
                        onClick={() => handleShare('linkedin')}
                      >
                        <Linkedin className="h-4 w-4" />
                        LinkedIn
                      </Button>
                      <Separator />
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-2"
                        onClick={() => handleShare('copy')}
                      >
                        <LinkIcon className="h-4 w-4" />
                        Copy Link
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </Card>

          {/* Article Body *//*}
          <Card className="p-6 md:p-10 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </Card>

          {/* Comments Section *//*}
          <Card className="p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <h2 className="mb-6">Comments ({articleComments.length})</h2>

            {/* Comment Form *//*}
            {user ? (
              <div className="mb-8">
                <div className="flex gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Share your thoughts..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="mb-3"
                      rows={3}
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setCommentText('')}>
                        Cancel
                      </Button>
                      <Button onClick={handleComment}>
                        Post Comment
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-8 p-6 border rounded-lg text-center">
                <p className="text-muted-foreground mb-4">Sign in to join the conversation</p>
                <Button onClick={() => onNavigate('login')}>Sign In</Button>
              </div>
            )}

            {/* Comments List *//*}
            <div className="space-y-6">
              {articleComments.map((comment, index) => (
                <div 
                  key={comment.id} 
                  className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={comment.authorAvatar} alt={comment.authorName} />
                    <AvatarFallback>{comment.authorName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-medium">{comment.authorName}</p>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{comment.content}</p>
                  </div>
                </div>
              ))}

              {articleComments.length === 0 && !user && (
                <p className="text-center text-muted-foreground py-8">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          </Card>
        </article>
      </div>
    </div>
  );
}*/