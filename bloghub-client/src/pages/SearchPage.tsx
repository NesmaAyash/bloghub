import { useState, useEffect } from 'react';
import { mockCategories } from '../data/mockData';
import { articleService } from '../services/article.service';
import { ArticleCard } from '../components/ArticleCard';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

interface SearchPageProps {
  onNavigate: (page: string, articleId?: string) => void;
}

export function SearchPage({ onNavigate }: SearchPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'popularity' | 'comments'>('date');
  const [showFilters, setShowFilters] = useState(false);
  const [allArticles, setAllArticles] = useState<any[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ جلب كل المقالات مرة واحدة
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        const data = await articleService.getArticles();
        setAllArticles(data);
        setFilteredArticles(data);
      } catch (error) {
        console.error('Failed to fetch articles:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticles();
  }, []);

  // ✅ فلترة وترتيب من الـ Frontend
  useEffect(() => {
    let results = [...allArticles];

    if (searchQuery.trim()) {
      results = results.filter(article =>
        article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      results = results.filter(article => article.category === selectedCategory);
    }

    switch (sortBy) {
      case 'popularity':
        results.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'comments':
        results.sort((a, b) => (b.commentsCount || 0) - (a.commentsCount || 0));
        break;
      case 'date':
      default:
        results.sort((a, b) =>
          new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()
        );
    }

    setFilteredArticles(results);
  }, [searchQuery, selectedCategory, sortBy, allArticles]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('date');
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || sortBy !== 'date';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="max-w-4xl mx-auto mb-12">
          <h1 className="mb-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            Search Articles
          </h1>

          {/* Search Bar */}
          <div className="relative mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by title, content, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-6 text-base"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {hasActiveFilters && <Badge variant="default" className="ml-1">Active</Badge>}
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} className="gap-2">
                <X className="h-4 w-4" />Clear Filters
              </Button>
            )}
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <Card className="p-6 mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-sm">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {mockCategories.map(category => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block mb-2 text-sm">Sort By</label>
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Latest</SelectItem>
                      <SelectItem value="popularity">Most Popular</SelectItem>
                      <SelectItem value="comments">Most Commented</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          )}

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap mb-6">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: "{searchQuery}"
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                </Badge>
              )}
              {selectedCategory !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Category: {selectedCategory}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory('all')} />
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              {isLoading ? 'Loading...' : `${filteredArticles.length} ${filteredArticles.length === 1 ? 'article' : 'articles'} found`}
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading articles...</p>
            </div>
          ) : filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article, index) => (
                <div
                  key={article.id}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-700"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ArticleCard
                    article={article}
                    onClick={() => onNavigate('article', String(article.id))}
                    onAuthorClick={(authorId) => onNavigate('user-articles', authorId)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="mb-2">No articles found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filters.
              </p>
              {hasActiveFilters && (
                <Button onClick={clearFilters}>Clear All Filters</Button>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}



/*import { useState, useEffect } from 'react';
import { mockArticles, mockCategories } from '../data/mockData';
import { ArticleCard } from '../components/ArticleCard';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Separator } from '../components/ui/separator';

interface SearchPageProps {
  onNavigate: (page: string, articleId?: string) => void;
}

export function SearchPage({ onNavigate }: SearchPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'popularity' | 'comments'>('date');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredArticles, setFilteredArticles] = useState(mockArticles);

  useEffect(() => {
    let results = [...mockArticles];

    // Filter by search query
    if (searchQuery.trim()) {
      results = results.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      results = results.filter(article => article.category === selectedCategory);
    }

    // Sort results
    switch (sortBy) {
      case 'popularity':
        results.sort((a, b) => b.views - a.views);
        break;
      case 'comments':
        results.sort((a, b) => b.commentsCount - a.commentsCount);
        break;
      case 'date':
      default:
        results.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    }

    setFilteredArticles(results);
  }, [searchQuery, selectedCategory, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('date');
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || sortBy !== 'date';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Search Header *//*}
        <div className="max-w-4xl mx-auto mb-12">
          <h1 className="mb-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            Search Articles
          </h1>
          
          {/* Search Bar *//*}
          <div className="relative mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by title, content, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-6 text-base"
            />
          </div>

          {/* Filter Toggle *//*}
          <div className="flex items-center justify-between mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <Badge variant="default" className="ml-1">
                  Active
                </Badge>
              )}
            </Button>

            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} className="gap-2">
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>

          {/* Filters Panel *//*}
          {showFilters && (
            <Card className="p-6 mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Filter *//*}
                <div>
                  <label className="block mb-2 text-sm">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {mockCategories.map(category => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort Filter *//*}
                <div>
                  <label className="block mb-2 text-sm">Sort By</label>
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Latest</SelectItem>
                      <SelectItem value="popularity">Most Popular</SelectItem>
                      <SelectItem value="comments">Most Commented</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          )}

          {/* Active Filters *//*}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap mb-6">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: "{searchQuery}"
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setSearchQuery('')}
                  />
                </Badge>
              )}
              {selectedCategory !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Category: {selectedCategory}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setSelectedCategory('all')}
                  />
                </Badge>
              )}
              {sortBy !== 'date' && (
                <Badge variant="secondary" className="gap-1">
                  Sort: {sortBy === 'popularity' ? 'Most Popular' : 'Most Commented'}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setSortBy('date')}
                  />
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Results *//*}
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              {filteredArticles.length} {filteredArticles.length === 1 ? 'article' : 'articles'} found
            </p>
          </div>

          {filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article, index) => (
                <div 
                  key={article.id}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-700"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ArticleCard
                    article={article}
                    onClick={() => onNavigate('article', article.id)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="mb-2">No articles found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filters to find what you're looking for.
              </p>
              {hasActiveFilters && (
                <Button onClick={clearFilters}>Clear All Filters</Button>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
*/