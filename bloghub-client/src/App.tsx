import { useState, useEffect } from 'react'; // ← أضف useEffect
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { Toaster } from './components/ui/sonner';
//import { mockNotifications } from './data/mockData';

// Import pages
import { HomePage } from './pages/HomePage';
import { ArticleDetailsPage } from './pages/ArticleDetailsPage';
import { SearchPage } from './pages/SearchPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AuthorDashboard } from './pages/AuthorDashboard';
import { CreateArticlePage } from './pages/CreateArticlePage';
import { MyArticlesPage } from './pages/MyArticlesPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { UserManagementPage } from './pages/UserManagementPage';
import { ContentModerationPage } from './pages/ContentModerationPage';
import { CategoryManagementPage } from './pages/CategoryManagementPage';
import { UserArticlesPage } from './pages/UserArticlesPage';
import { SettingsPage } from './pages/SettingsPage';
import { notificationService } from './services/notification.service'; // ← أضف هذا

// Placeholder components - will be created in next steps
function CategoriesPage() {
  return <div className="container mx-auto px-4 py-8"><h1>Categories - Coming Soon</h1></div>;
}

function AboutPage() {
  return <div className="container mx-auto px-4 py-8"><h1>About - Coming Soon</h1></div>;
}

function ContactPage() {
  return <div className="container mx-auto px-4 py-8"><h1>Contact - Coming Soon</h1></div>;
}

function PrivacyPage() {
  return <div className="container mx-auto px-4 py-8"><h1>Privacy Policy - Coming Soon</h1></div>;
}

function TermsPage() {
  return <div className="container mx-auto px-4 py-8"><h1>Terms of Service - Coming Soon</h1></div>;
}

function AppContent() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedArticleId, setSelectedArticleId] = useState<string | undefined>(undefined);
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(undefined);
  const [unreadCount, setUnreadCount] = useState(0);


  
useEffect(() => {
  const fetchUnreadCount = async () => {
    console.log('user:', user); // ← أضف هذا
    if (!user) {
      setUnreadCount(0);
      return;
    }
    try {
      const count = await notificationService.getUnreadCount();
      console.log('unread count:', count); // ← أضف هذا
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  fetchUnreadCount();
  const interval = setInterval(fetchUnreadCount, 30000);
  return () => clearInterval(interval);
}, [user]);

  const handleNavigate = (page: string, articleId?: string) => {
    setCurrentPage(page);
    setSelectedArticleId(articleId);
    if (page === 'user-articles') setSelectedUserId(articleId);
    // ✅ لما يفتح الـ notifications يصفر العداد
    if (page === 'notifications') setUnreadCount(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage onNavigate={handleNavigate} />;
case 'article':
  return selectedArticleId
    ? <ArticleDetailsPage articleId={selectedArticleId} onNavigate={handleNavigate} />
    : <HomePage onNavigate={handleNavigate} />;      case 'search': return <SearchPage onNavigate={handleNavigate} />;
      case 'login': return <LoginPage onNavigate={handleNavigate} />;
      case 'register': return <RegisterPage onNavigate={handleNavigate} />;
      case 'author-dashboard': return <AuthorDashboard onNavigate={handleNavigate} />;
      case 'create-article': return <CreateArticlePage onNavigate={handleNavigate} articleId={selectedArticleId} />;
      case 'my-articles': return <MyArticlesPage onNavigate={handleNavigate} />;
      case 'profile': return <ProfilePage onNavigate={handleNavigate} />;
      case 'notifications': return <NotificationsPage onNavigate={handleNavigate} />;
      case 'admin-dashboard': return <AdminDashboard onNavigate={handleNavigate} />;
      case 'user-management': return <UserManagementPage onNavigate={handleNavigate} />;
      case 'content-moderation': return <ContentModerationPage onNavigate={handleNavigate} />;
      case 'category-management': return <CategoryManagementPage onNavigate={handleNavigate} />;
      case 'user-articles': return <UserArticlesPage userId={selectedUserId} onNavigate={handleNavigate} />;
      case 'settings': return <SettingsPage onNavigate={handleNavigate} />;
      default: return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation
        onNavigate={handleNavigate}
        currentPage={currentPage}
        unreadNotifications={unreadCount}
      />
      <main className="flex-1">
        {renderPage()}
      </main>
      <Footer onNavigate={handleNavigate} />
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;