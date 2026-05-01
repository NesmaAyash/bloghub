import { useState, useEffect } from 'react';
//import { mockCategories } from '../data/mockData';
import { articleService } from '../services/article.service';
import { ArticleCard } from '../components/ArticleCard';
import { TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { categoryService } from '../services/category.service';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../components/ui/pagination';

interface HomePageProps {
  onNavigate: (page: string, articleId?: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [articles, setArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 6;
const [categories, setCategories] = useState<any[]>([]);

useEffect(() => {
  const fetchCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };
  fetchCategories();
}, []);
  // ✅ جلب المقالات من الـ API
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        const data = await articleService.getArticles();
        setArticles(data);
      } catch (error) {
        console.error('Failed to fetch articles:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const featuredArticles = articles.filter(a => a.featured);
  const regularArticles = articles.filter(a => !a.featured);

  const filteredArticles = selectedCategory
    ? regularArticles.filter(a => a.category === selectedCategory)
    : regularArticles;

  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
  const startIndex = (currentPage - 1) * articlesPerPage;
  const paginatedArticles = filteredArticles.slice(startIndex, startIndex + articlesPerPage);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading articles...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-muted/50 to-background py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
              Discover Stories That Matter
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
              Explore thousands of articles written by passionate authors from around the world
            </p>
          </div>
        </div>
      </section>

      {/* Categories — مازالت من mockData لأن Backend مافيه Categories بعد */}
      <section className="border-b bg-background sticky top-16 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <TrendingUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryClick('')}
              className="flex-shrink-0"
            >
              All
            </Button>
          {categories.map(category => (
  <Button
    key={category.id}
    variant={selectedCategory === category.name ? 'default' : 'outline'}
    size="sm"
    onClick={() => handleCategoryClick(category.name)}
    className="flex-shrink-0"
  >
    {category.name}
    <Badge variant="secondary" className="ml-2">
      {articles.filter(a => a.category === category.name).length}
    </Badge>
  </Button>
))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Featured Articles */}
        {!selectedCategory && featuredArticles.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-2 mb-8">
              <div className="h-8 w-1 bg-primary rounded-full" />
              <h2>Featured Articles</h2>
            </div>
            <div className="space-y-6">
              {featuredArticles.map((article, index) => (
                <div
                  key={article.id}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-700"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ArticleCard
                    article={article}
                    onClick={() => onNavigate('article', article.id)}
                    onAuthorClick={(authorId) => onNavigate('user-articles', authorId)}
                    featured
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Latest Articles */}
        <section>
          <div className="flex items-center gap-2 mb-8">
            <div className="h-8 w-1 bg-primary rounded-full" />
            <h2>{selectedCategory ? `${selectedCategory} Articles` : 'Latest Articles'}</h2>
          </div>

          {paginatedArticles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {paginatedArticles.map((article, index) => (
                  <div
                    key={article.id}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-700"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <ArticleCard
                      article={article}
                      onClick={() => onNavigate('article', article.id)}
                      onAuthorClick={(authorId) => onNavigate('user-articles', authorId)}
                    />
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No articles found.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}


/*import { useState } from 'react';
import { mockArticles, mockCategories } from '../data/mockData';
import { ArticleCard } from '../components/ArticleCard';
import { TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../components/ui/pagination';

interface HomePageProps {
  onNavigate: (page: string, articleId?: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 6;

  

  const featuredArticles = mockArticles.filter(a => a.featured);
  const regularArticles = mockArticles.filter(a => !a.featured);

  // Filter articles by category
  const filteredArticles = selectedCategory
    ? regularArticles.filter(a => a.category === selectedCategory)
    : regularArticles;

  // Pagination
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
  const startIndex = (currentPage - 1) * articlesPerPage;
  const paginatedArticles = filteredArticles.slice(startIndex, startIndex + articlesPerPage);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section *//*
      <section className="bg-gradient-to-b from-muted/50 to-background py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
              Discover Stories That Matter
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
              Explore thousands of articles written by passionate authors from around the world
            </p>
          </div>
        </div>
      </section>

      {/* Categories *//*
      <section className="border-b bg-background sticky top-16 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <TrendingUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryClick('')}
              className="flex-shrink-0"
            >
              All
            </Button>
            {mockCategories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.name ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleCategoryClick(category.name)}
                className="flex-shrink-0"
              >
                {category.name}
                <Badge variant="secondary" className="ml-2">
                  {category.articlesCount}
                </Badge>
              </Button>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Featured Articles *//*
        {!selectedCategory && featuredArticles.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-2 mb-8">
              <div className="h-8 w-1 bg-primary rounded-full" />
              <h2>Featured Articles</h2>
            </div>
            <div className="space-y-6">
              {featuredArticles.map((article, index) => (
                <div 
                  key={article.id}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-700"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ArticleCard
                    article={article}
                    onClick={() => onNavigate('article', article.id)}
                    onAuthorClick={(authorId) => onNavigate('user-articles', authorId)}
                    featured
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Latest Articles *//*
        <section>
          <div className="flex items-center gap-2 mb-8">
            <div className="h-8 w-1 bg-primary rounded-full" />
            <h2>{selectedCategory ? `${selectedCategory} Articles` : 'Latest Articles'}</h2>
          </div>
          
          {paginatedArticles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {paginatedArticles.map((article, index) => (
                  <div 
                    key={article.id}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-700"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <ArticleCard
                      article={article}
                      onClick={() => onNavigate('article', article.id)}
                      onAuthorClick={(authorId) => onNavigate('user-articles', authorId)}
                    />
                  </div>
                ))}
              </div>

              {/* Pagination *//*
              {totalPages > 1 && (
                <div className="flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No articles found in this category.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
*/