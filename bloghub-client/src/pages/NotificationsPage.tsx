import { useState, useEffect } from 'react';
import { notificationService } from '../services/notification.service';import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { Bell, Heart, MessageCircle, AlertCircle, Check, CheckCheck, Trash2, Settings } from 'lucide-react';

interface NotificationsPageProps {
  onNavigate: (page: string, articleId?: string) => void;
}

export function NotificationsPage({ onNavigate }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // ✅ جلب الـ notifications من الـ API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        const data = await notificationService.getNotifications();
        setNotifications(data);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const displayNotifications = filter === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications;

  // ✅ Mark as read
  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  // ✅ Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  // ✅ مؤقتاً — حذف من الـ state فقط
  const handleDelete = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('Notification deleted');
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) handleMarkAsRead(notification.id);
    if (notification.postId) onNavigate('article', String(notification.postId));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="h-5 w-5 text-red-600" />;
      case 'comment': return <MessageCircle className="h-5 w-5 text-blue-600" />;
      case 'report': return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default: return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
              <h1 className="mb-2">Notifications</h1>
              <p className="text-muted-foreground">
                {unreadCount > 0
                  ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                  : "You're all caught up!"}
              </p>
            </div>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>

          {/* Actions Bar */}
          <Card className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <Tabs value={filter} onValueChange={(v: any) => setFilter(v)} className="w-full md:w-auto">
                  <TabsList>
                    <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
                    <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
                  </TabsList>
                </Tabs>
                {unreadCount > 0 && (
                  <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} className="gap-2">
                    <CheckCheck className="h-4 w-4" />
                    Mark all as read
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notifications List */}
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : displayNotifications.length > 0 ? (
            <div className="space-y-2">
              {displayNotifications.map((notification, index) => (
                <Card
                  key={notification.id}
                  className={`overflow-hidden transition-all duration-300 hover:shadow-md cursor-pointer animate-in fade-in slide-in-from-bottom-2 ${
                    !notification.isRead ? 'border-l-4 border-l-primary bg-muted/50' : ''
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className={`flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center ${
                        notification.type === 'like' ? 'bg-red-100' :
                        notification.type === 'comment' ? 'bg-blue-100' :
                        'bg-gray-100'
                      }`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{notification.title}</h4>
                              {!notification.isRead && (
                                <Badge variant="default" className="h-5 text-xs">New</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {formatDate(notification.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {!notification.isRead && (
                              <Button variant="ghost" size="icon"
                                onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notification.id); }}
                                title="Mark as read">
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon"
                              onClick={(e) => { e.stopPropagation(); handleDelete(notification.id); }}
                              title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="mb-2">No notifications</h3>
              <p className="text-muted-foreground">
                {filter === 'unread' ? 'No unread notifications' : "You don't have any notifications yet"}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}


/*import { useState } from 'react';
import { mockNotifications, Notification } from '../data/mockData';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { 
  Bell, 
  Heart, 
  MessageCircle, 
  AlertCircle, 
  Check, 
  CheckCheck,
  Trash2,
  Settings
} from 'lucide-react';

interface NotificationsPageProps {
  onNavigate: (page: string, articleId?: string) => void;
}

export function NotificationsPage({ onNavigate }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter(n => !n.read).length;
  const displayNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
    toast.success('Notification deleted');
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    if (notification.articleId) {
      onNavigate('article', notification.articleId);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="h-5 w-5 text-red-600" />;
      case 'comment':
        return <MessageCircle className="h-5 w-5 text-blue-600" />;
      case 'report':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'system':
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header *//*
          <div className="flex items-center justify-between mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
              <h1 className="mb-2">Notifications</h1>
              <p className="text-muted-foreground">
                {unreadCount > 0 
                  ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                  : 'You\'re all caught up!'
                }
              </p>
            </div>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>

          {/* Actions Bar *//*
          <Card className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <Tabs value={filter} onValueChange={(v: any) => setFilter(v)} className="w-full md:w-auto">
                  <TabsList>
                    <TabsTrigger value="all">
                      All ({notifications.length})
                    </TabsTrigger>
                    <TabsTrigger value="unread">
                      Unread ({unreadCount})
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleMarkAllAsRead}
                      className="gap-2"
                    >
                      <CheckCheck className="h-4 w-4" />
                      Mark all as read
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications List *//*
          {displayNotifications.length > 0 ? (
            <div className="space-y-2">
              {displayNotifications.map((notification, index) => (
                <Card 
                  key={notification.id}
                  className={`overflow-hidden transition-all duration-300 hover:shadow-md cursor-pointer animate-in fade-in slide-in-from-bottom-2 ${
                    !notification.read ? 'border-l-4 border-l-primary bg-muted/50' : ''
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Icon *//*
                      <div className={`flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center ${
                        notification.type === 'like' ? 'bg-red-100' :
                        notification.type === 'comment' ? 'bg-blue-100' :
                        notification.type === 'report' ? 'bg-yellow-100' :
                        'bg-gray-100'
                      }`}>
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content *//*
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{notification.title}</h4>
                              {!notification.read && (
                                <Badge variant="default" className="h-5 text-xs">New</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {formatDate(notification.createdAt)}
                            </p>
                          </div>

                          {/* Actions *//*
                          <div className="flex items-center gap-2">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notification.id);
                                }}
                                title="Mark as read"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                e.stopPropagation();
                                handleDelete(notification.id);
                              }}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="mb-2">No notifications</h3>
              <p className="text-muted-foreground">
                {filter === 'unread' 
                  ? 'You have no unread notifications' 
                  : 'You don\'t have any notifications yet'
                }
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
*/