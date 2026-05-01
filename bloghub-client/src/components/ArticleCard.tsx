import { Calendar, Eye, Heart, MessageCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { UserAvatar } from './UserAvatar';
import { formatDate } from '../utils/date';

// ✅ بدل Article من mockData
interface ArticleCardProps {
  article: {
    id: string | number;
    title: string;
    excerpt?: string;
    content?: string;
    coverImage?: string;
    authorId: string | number;
    authorName?: string;
    authorAvatar?: string;
    publishedAt?: string;
    category?: string;
    views?: number;
    likes?: number;
    commentsCount?: number;
    featured?: boolean;
  };
  onClick: () => void;
  onAuthorClick?: (authorId: string) => void;
  featured?: boolean;
}

export function ArticleCard({ article, onClick, onAuthorClick, featured = false }: ArticleCardProps) {
  

  const readingTime = Math.ceil((article.content?.split(' ').length || 0) / 200);

  // ✅ قيم افتراضية لو الحقول فاضية
  const coverImage = article.coverImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=400&fit=crop';
  const authorName = article.authorName || 'Unknown Author';
  const authorAvatar = article.authorAvatar || '';
  const excerpt = article.excerpt || '';
  const category = article.category || 'General';
console.log('publishedAt from API:', article.publishedAt);
console.log('formatted:', formatDate(article.publishedAt));
  if (featured) {
    return (
      <Card
        className="overflow-hidden cursor-pointer group hover:shadow-lg transition-all duration-300 border-2"
        onClick={onClick}
      >
        <div className="grid md:grid-cols-2 gap-0">
          <div className="relative h-64 md:h-full overflow-hidden">
            <img
              src={coverImage}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <Badge className="absolute top-4 left-4 bg-primary">Featured</Badge>
          </div>
          <div className="p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">{category}</Badge>
                <div className="flex items-center text-sm text-muted-foreground gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{readingTime} min read</span>
                </div>
              </div>
              <h2 className="mb-3 group-hover:text-primary transition-colors line-clamp-2">
                {article.title}
              </h2>
              <p className="text-muted-foreground mb-4 line-clamp-3">{excerpt}</p>
            </div>
            <div>
              <div className="flex items-center justify-between pt-4 border-t">
                <div
                  className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAuthorClick?.(String(article.authorId));
                  }}
                >
                 <UserAvatar name={authorName} avatar={authorAvatar} size="md" />
                  <div>
                    <p className="text-sm font-medium hover:text-primary transition-colors">{authorName}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(article.publishedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {article.views || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    {article.likes || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className="overflow-hidden cursor-pointer group hover:shadow-lg transition-all duration-300"
      onClick={onClick}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={coverImage}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary">{category}</Badge>
          <div className="flex items-center text-sm text-muted-foreground gap-1">
            <Clock className="h-3 w-3" />
            <span>{readingTime} min</span>
          </div>
        </div>
        <h3 className="mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {article.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{excerpt}</p>
      </CardContent>
      <CardFooter className="px-5 pb-5 pt-0">
        <div className="flex items-center justify-between w-full">
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onAuthorClick?.(String(article.authorId));
            }}
          >
         <UserAvatar name={authorName} avatar={authorAvatar} size="md" />
            <div>
              <p className="text-sm font-medium hover:text-primary transition-colors">{authorName}</p>
              <p className="text-xs text-muted-foreground">{formatDate(article.publishedAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              {article.likes || 0}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              {article.commentsCount || 0}
            </span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}




/*import { Article } from '../data/mockData';
import { Calendar, Eye, Heart, MessageCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface ArticleCardProps {
  article: Article;
  onClick: () => void;
  onAuthorClick?: (authorId: string) => void;
  featured?: boolean;
}

export function ArticleCard({ article, onClick, onAuthorClick, featured = false }: ArticleCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const readingTime = Math.ceil(article.content.split(' ').length / 200);

  if (featured) {
    return (
      <Card 
        className="overflow-hidden cursor-pointer group hover:shadow-lg transition-all duration-300 border-2"
        onClick={onClick}
      >
        <div className="grid md:grid-cols-2 gap-0">
          <div className="relative h-64 md:h-full overflow-hidden">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <Badge className="absolute top-4 left-4 bg-primary">Featured</Badge>
          </div>
          <div className="p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">{article.category}</Badge>
                <div className="flex items-center text-sm text-muted-foreground gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{readingTime} min read</span>
                </div>
              </div>
              <h2 className="mb-3 group-hover:text-primary transition-colors line-clamp-2">
                {article.title}
              </h2>
              <p className="text-muted-foreground mb-4 line-clamp-3">{article.excerpt}</p>
            </div>
            <div>
              <div className="flex items-center justify-between pt-4 border-t">
                <div 
                  className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAuthorClick?.(article.authorId);
                  }}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={article.authorAvatar} alt={article.authorName} />
                    <AvatarFallback>{article.authorName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium hover:text-primary transition-colors">{article.authorName}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(article.publishedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {article.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    {article.likes}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className="overflow-hidden cursor-pointer group hover:shadow-lg transition-all duration-300"
      onClick={onClick}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={article.coverImage}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary">{article.category}</Badge>
          <div className="flex items-center text-sm text-muted-foreground gap-1">
            <Clock className="h-3 w-3" />
            <span>{readingTime} min</span>
          </div>
        </div>
        <h3 className="mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {article.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{article.excerpt}</p>
      </CardContent>
      <CardFooter className="px-5 pb-5 pt-0">
        <div className="flex items-center justify-between w-full">
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onAuthorClick?.(article.authorId);
            }}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={article.authorAvatar} alt={article.authorName} />
              <AvatarFallback>{article.authorName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium hover:text-primary transition-colors">{article.authorName}</p>
              <p className="text-xs text-muted-foreground">{formatDate(article.publishedAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
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
      </CardFooter>
    </Card>
  );
}*/