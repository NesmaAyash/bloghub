import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
//import { mockCategories, mockArticles } from '../data/mockData';
import { categoryService } from '../services/category.service';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import apiClient from '../services/api.client';
import { formatDate } from '../utils/date';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner@2.0.3';
import { articleService } from '../services/article.service';

import { 
  Save, 
  Eye, 
  Send, 
  Image as ImageIcon, 
  X,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Link as LinkIcon,
  Quote
} from 'lucide-react';

interface CreateArticlePageProps {
  onNavigate: (page: string) => void;
  articleId?: string; // For edit mode
}

export function CreateArticlePage({ onNavigate, articleId }: CreateArticlePageProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [showPreview, setShowPreview] = useState(false);
const [categories, setCategories] = useState<any[]>([]);
const [isUploading, setIsUploading] = useState(false);
const [coverImageFile, setCoverImageFile] = useState<File | null>(null);

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
  // Load article data when editing
  /*useEffect(() => {
    if (articleId) {
      const article = mockArticles.find(a => a.id === articleId);
      if (article) {
        setTitle(article.title);
        setExcerpt(article.excerpt);
        // Convert HTML content to plain text for editing
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = article.content;
        setContent(tempDiv.textContent || tempDiv.innerText || '');
        setCategory(article.category);
        setTags(article.tags);
        setCoverImage(article.coverImage);
      }
    }
  }, [articleId]);*/

  // ✅ بدله
useEffect(() => {
  if (articleId) {
    const loadArticle = async () => {
      try {
        const article = await articleService.getArticleById(articleId);
        if (article) {
          setTitle(article.title ?? '');
          setExcerpt(article.excerpt ?? '');
          setContent(article.content ?? '');
          setCategory(article.category ?? '');
          setTags(article.tags ?? []);
          setCoverImage(article.coverImage ?? '');
        }
      } catch (error) {
        toast.error('Failed to load article');
      }
    };
    loadArticle();
  }
}, [articleId]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  console.log('file:', file); // ← أضف هذا
  if (!file) return;
  setCoverImageFile(file);
  const reader = new FileReader();
  reader.onload = (e) => setCoverImage(e.target?.result as string);
  reader.readAsDataURL(file);
};


/*
  const handleSaveDraft = () => {
    if (!title.trim()) {
      toast.error('Please add a title');
      return;
    }
    toast.success(articleId ? 'Article updated successfully!' : 'Draft saved successfully!');
  };

  const handlePublish = () => {
    if (!title.trim()) {
      toast.error('Please add a title');
      return;
    }
    if (!content.trim()) {
      toast.error('Please add some content');
      return;
    }
    if (!category) {
      toast.error('Please select a category');
      return;
    }
    
    toast.success(articleId ? 'Article updated successfully!' : 'Article published successfully!');
    onNavigate('my-articles');
  };*/

// ✅ Save Draft
const handleSaveDraft = async () => {
  if (!title.trim()) {
    toast.error('Please add a title');
    return;
  }

  try {
    const articleData = {
      title,
      excerpt,
      content,
      coverImage,
      category,
      tags,
      authorId: String(user?.id),
      status: 'draft' as const,
      featured: false,
    };

  if (articleId) {
  await apiClient.put(`/Post/${articleId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
} else {
  await apiClient.post('/Post', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}
  } catch (error) {
    toast.error('Failed to save draft');
  }
};

// ✅ Publish
const handlePublish = async () => {
  if (!title.trim()) {
    toast.error('Please add a title');
    return;
  }
  if (!content.trim()) {
    toast.error('Please add some content');
    return;
  }
  if (!category) {
    toast.error('Please select a category');
    return;
  }
console.log('coverImageFile:', coverImageFile); // ← أضف هذا
console.log('coverImage:', coverImage); // ← أضف هذا
  try {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('excerpt', excerpt);
    formData.append('content', content);
    formData.append('category', category);
    formData.append('authorId', String(user?.id));
    formData.append('status', 'published');
    formData.append('featured', 'false');
    tags.forEach(tag => formData.append('tags', tag));

    // ✅ لو الـ coverImage ملف محلي أو URL
    if (coverImageFile) {
      formData.append('CoverImage', coverImageFile);
    } else {
      formData.append('coverImage', coverImage);
    }

   if (articleId) {
  await apiClient.put(`/Post/${articleId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
} else {
  await apiClient.post('/Post', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}
    toast.success('Article published successfully!');
    onNavigate('my-articles');
  } catch (error) {
    toast.error('Failed to publish article');
  }
};

  const insertFormatting = (format: string) => {
    // Simple formatting helper (in a real app, you'd use a rich text editor)
    const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText || 'italic text'}*`;
        break;
      case 'h2':
        formattedText = `## ${selectedText || 'Heading'}`;
        break;
      case 'link':
        formattedText = `[${selectedText || 'link text'}](url)`;
        break;
      case 'quote':
        formattedText = `> ${selectedText || 'quote'}`;
        break;
      case 'ul':
        formattedText = `- ${selectedText || 'list item'}`;
        break;
      case 'ol':
        formattedText = `1. ${selectedText || 'list item'}`;
        break;
    }

    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div>
            <h1 className="mb-2">{articleId ? 'Edit Article' : 'Create New Article'}</h1>
            <p className="text-muted-foreground">Share your thoughts with the world</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowPreview(!showPreview)}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              {showPreview ? 'Edit' : 'Preview'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleSaveDraft}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Save Draft
            </Button>
            <Button 
              onClick={handlePublish}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              Publish
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            {!showPreview ? (
              <>
                {/* Title */}
                <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                  <CardContent className="pt-6">
                    <Input
                      placeholder="Article Title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="text-2xl font-semibold border-none px-0 focus-visible:ring-0"
                    />
                  </CardContent>
                </Card>

                {/* Excerpt */}
                <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                  <CardHeader>
                    <CardTitle className="text-base">Excerpt</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Write a brief summary of your article (optional)..."
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      rows={3}
                    />
                  </CardContent>
                </Card>

                {/* Content Editor */}
                <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                  <CardHeader>
                    <CardTitle className="text-base">Content</CardTitle>
                    <div className="flex items-center gap-1 pt-2 flex-wrap">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => insertFormatting('bold')}
                        title="Bold"
                      >
                        <Bold className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => insertFormatting('italic')}
                        title="Italic"
                      >
                        <Italic className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => insertFormatting('h2')}
                        title="Heading"
                      >
                        <Heading2 className="h-4 w-4" />
                      </Button>
                      <Separator orientation="vertical" className="h-6" />
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => insertFormatting('ul')}
                        title="Bullet List"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => insertFormatting('ol')}
                        title="Numbered List"
                      >
                        <ListOrdered className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => insertFormatting('quote')}
                        title="Quote"
                      >
                        <Quote className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => insertFormatting('link')}
                        title="Link"
                      >
                        <LinkIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      name="content"
                      placeholder="Write your article content here... (Supports Markdown)"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={20}
                      className="font-mono text-sm"
                    />
                  </CardContent>
                </Card>
              </>
            ) : (
              /* Preview Mode */
              <Card className="animate-in fade-in duration-500">
                <CardContent className="pt-6">
                  <h1 className="mb-4">{title || 'Untitled Article'}</h1>
                  {excerpt && (
                    <p className="text-lg text-muted-foreground mb-6 italic">{excerpt}</p>
                  )}
                  {coverImage && (
                    <img 
                      src={coverImage} 
                      alt="Cover" 
                      className="w-full h-64 object-cover rounded-lg mb-6"
                    />
                  )}
                  <Separator className="my-6" />
                  <div className="prose prose-lg max-w-none">
                    {content.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4">{paragraph}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
       {/* Cover Image */}
<Card className="animate-in fade-in slide-in-from-right-4 duration-700 delay-100">
  <CardHeader>
    <CardTitle className="text-base">Cover Image</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-3">
      {coverImage ? (
        <div className="relative">
          <img
            src={coverImage}
            alt="Cover"
            className="w-full h-32 object-cover rounded-lg"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6"
            onClick={() => setCoverImage('')}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
      
<label className="cursor-pointer">
  <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-muted/50 transition-colors">
    {coverImage ? (
      <div className="relative">
        <img src={coverImage} alt="Cover" className="w-full h-32 object-cover rounded-lg" />
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={() => { setCoverImage(''); setCoverImageFile(null); }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    ) : (
      <>
        <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Click to upload image</p>
        <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
      </>
    )}
  </div>
  <input
    type="file"
    accept="image/*"
    className="hidden"
    onChange={handleImageUpload}
  />
</label>
      )}
      <Input
        placeholder="Or paste image URL"
        value={coverImage}
        onChange={(e) => setCoverImage(e.target.value)}
        className="text-sm"
      />
    </div>
  </CardContent>
</Card>

            {/* Category */}
           
            {/* Category */}
<Card className="animate-in fade-in slide-in-from-right-4 duration-700 delay-150">
  <CardHeader>
    <CardTitle className="text-base">Category</CardTitle>
  </CardHeader>
  <CardContent>
    <Select value={category} onValueChange={setCategory}>
      <SelectTrigger>
        <SelectValue placeholder="Select a category" />
      </SelectTrigger>
      <SelectContent>
        {categories.map(cat => (
          <SelectItem key={cat.id} value={cat.name}>
            {cat.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </CardContent>
</Card>
            {/* Tags */}
            <Card className="animate-in fade-in slide-in-from-right-4 duration-700 delay-200">
              <CardHeader>
                <CardTitle className="text-base">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    />
                    <Button onClick={handleAddTag} size="sm">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => handleRemoveTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Author Info */}
            <Card className="animate-in fade-in slide-in-from-right-4 duration-700 delay-250">
              <CardHeader>
                <CardTitle className="text-base">Author</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    {user?.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}