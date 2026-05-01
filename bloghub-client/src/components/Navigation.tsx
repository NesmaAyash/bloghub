import { Bell, Menu, X, User, LogOut, Settings, PenSquare, LayoutDashboard, Moon, Sun, FileText, Sparkles, Search, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { UserAvatar } from '../components/UserAvatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';

interface NavigationProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  unreadNotifications?: number;
}

export function Navigation({ onNavigate, currentPage, unreadNotifications = 0 }: NavigationProps) {
  const { user, userRole, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    onNavigate('home');
  };

  const navLinks = [
    { label: 'Explore', page: 'home', show: true },
    { label: 'Dashboard', page: userRole === 'author' ? 'author-dashboard' : 'admin-dashboard', show: user && (userRole === 'author' || userRole === 'admin') },
{ label: 'My Articles', page: 'my-articles', show: user && (userRole === 'author' || userRole === 'admin') },  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onNavigate('home')}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/60 rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg group-hover:shadow-xl transition-all group-hover:scale-105">
                <PenSquare className="h-5 w-5" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent hidden sm:inline">
                BlogHub
              </span>
              <span className="text-[10px] text-muted-foreground hidden lg:inline -mt-1">Modern Blogging Platform</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => 
              link.show && (
                <button
                  key={link.page}
                  onClick={() => onNavigate(link.page)}
                  className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    currentPage === link.page 
                      ? 'text-primary' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {link.label}
                  {currentPage === link.page && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full" />
                  )}
                </button>
              )
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Search Icon */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onNavigate('search')}
              className="rounded-full hover:bg-muted/80 transition-all hover:scale-105"
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full hover:bg-muted/80 transition-all hover:scale-105 hover:rotate-12"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 transition-all" />
              ) : (
                <Moon className="h-5 w-5 transition-all" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>

            {user ? (
              <>
                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onNavigate('notifications')}
                  className="relative rounded-full hover:bg-muted/80 transition-all hover:scale-105"
                >
                  <Bell className="h-5 w-5" />
               {unreadNotifications > 0 && (
  <Badge
    variant="destructive"
    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] font-bold rounded-full shadow-lg animate-pulse"
  >
    {unreadNotifications > 9 ? '9+' : unreadNotifications}
  </Badge>
)}
                </Button>

                {/* Write Button - For Authors */}
               {(userRole === 'author' || userRole === 'admin') && (
  <Button
    onClick={() => onNavigate('create-article')}
    size="sm"
    className="hidden lg:flex items-center gap-2 rounded-full px-4 shadow-md hover:shadow-lg transition-all hover:scale-105 bg-gradient-to-r from-primary to-primary/90"
  >
    <PenSquare className="h-4 w-4" />
    Write
  </Button>
)}

                {/* User Avatar & Menu */}
                <div className="flex items-center gap-1">
                  {/* Avatar - Click to go to profile */}
                  <Button 
                    variant="ghost" 
                    className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-primary/20 transition-all p-0"
                    onClick={() => onNavigate('profile')}
                  >
                    <Avatar className="h-10 w-10 ring-2 ring-background shadow-md">
                      <AvatarImage src={user.avatar} alt={user.name} />
                     <UserAvatar name={user.name} avatar={user.avatar} size="md" className="ring-2 ring-background shadow-md" />                        {user.name[0]}
                      
                    </Avatar>
                  </Button>

                  {/* Dropdown Menu Trigger */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-muted/80 transition-all"
                      >
                        <ChevronDown className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64" align="end" sideOffset={8}>
                      <DropdownMenuLabel>
                        <div className="flex items-center gap-3 py-2">
                          <Avatar className="h-12 w-12 ring-2 ring-primary/10">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <UserAvatar name={user.name} avatar={user.avatar} size="md" className="ring-2 ring-background shadow-md" />                              {user.name[0]}
                            
                          </Avatar>
                          <div className="flex flex-col space-y-1 flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{user.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            <Badge variant="secondary" className="w-fit text-[10px] px-2 py-0">
                              {userRole === 'admin' ? 'Administrator' : userRole === 'author' ? 'Author' : 'Visitor'}
                            </Badge>
                          </div>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      
                      {(userRole === 'author' || userRole === 'admin') && (
                        <>
                         <DropdownMenuItem onClick=
                         {() => onNavigate('author-dashboard')}>
                            <LayoutDashboard className="h-4 w-4 text-primary" />
                            <span>Dashboard</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onNavigate('my-articles')}
                            className="gap-3 py-2.5 cursor-pointer"
                          >
                            <FileText className="h-4 w-4 text-blue-500" />
                            <span>My Articles</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onNavigate('create-article')}
                            className="gap-3 py-2.5 cursor-pointer"
                          >
                            <PenSquare className="h-4 w-4 text-green-500" />
                            <span>Write Article</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      
                      {userRole === 'admin' && (
                        <>
                          <DropdownMenuItem 
                            onClick={() => onNavigate('admin-dashboard')}
                            className="gap-3 py-2.5 cursor-pointer"
                          >
                            <Sparkles className="h-4 w-4 text-amber-500" />
                            <span>Admin Panel</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      
                      <DropdownMenuItem 
                        onClick={() => onNavigate('profile')}
                        className="gap-3 py-2.5 cursor-pointer"
                      >
                        <User className="h-4 w-4 text-purple-500" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onNavigate('settings')}
                        className="gap-3 py-2.5 cursor-pointer"
                      >
                        <Settings className="h-4 w-4 text-slate-500" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={handleLogout}
                        className="gap-3 py-2.5 cursor-pointer text-destructive focus:text-destructive"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  onClick={() => onNavigate('login')}
                  className="rounded-full hover:bg-muted/80"
                >
                  Login
                </Button>
                <Button 
                  onClick={() => onNavigate('register')}
                  className="rounded-full shadow-md hover:shadow-lg transition-all hover:scale-105 bg-gradient-to-r from-primary to-primary/90"
                >
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-full hover:bg-muted/80"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 transition-transform rotate-90" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-1 animate-in slide-in-from-top-4 duration-300">
            {navLinks.map(link => 
              link.show && (
                <button
                  key={link.page}
                  onClick={() => {
                    onNavigate(link.page);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all ${
                    currentPage === link.page 
                      ? 'bg-primary text-primary-foreground font-medium shadow-sm' 
                      : 'hover:bg-muted/80 text-muted-foreground'
                  }`}
                >
                  <span>{link.label}</span>
                </button>
              )
            )}

            {/* Mobile Profile Link */}
            {user && (
              <button
                onClick={() => {
                  onNavigate('profile');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-muted/80 text-muted-foreground transition-colors"
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </button>
            )}

            {/* Mobile Search Button */}
            <button
              onClick={() => {
                onNavigate('search');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-muted/80 text-muted-foreground transition-colors"
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
            </button>

           {user && (userRole === 'author' || userRole === 'admin') && (
             <>
              <div className="h-px bg-border my-2" />
               <button
                  onClick={() => {
                    onNavigate('create-article');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium shadow-sm"
                >
                  <PenSquare className="h-4 w-4" />
                  <span>Write Article</span>
                </button>
              </>
            )}

            {!user && (
              <>
                <div className="h-px bg-border my-2" />
                <button
                  onClick={() => {
                    onNavigate('login');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-muted/80 text-muted-foreground transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>Login</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('register');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium shadow-sm"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Sign Up</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
