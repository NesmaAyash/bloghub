import { useState, useEffect, useRef } from 'react';  // ← لازم useRef موجود
import { authorService } from '../services/author.service';  // ← موجود
import { useAuth } from '../contexts/AuthContext';
import apiClient, { handleApiError } from '../services/api.client';
import { articleService } from '../services/article.service';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
//import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { Camera, Save, Mail, User as UserIcon, Calendar, Award } from 'lucide-react';
import { UserAvatar } from '../components/UserAvatar';

interface ProfilePageProps {
  onNavigate: (page: string) => void;
}

export function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isSaving, setIsSaving] = useState(false);
  const [myArticles, setMyArticles] = useState<any[]>([]);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);

    useEffect(() => {
    const fetchArticles = async () => {
      if (!user) return;
      try {
        const all = await articleService.getArticles();
        const mine = all.filter(a => String(a.authorId) === String(user.id));
        setMyArticles(mine);
      } catch (error) {
        console.error('Failed to fetch articles:', error);
      }
    };
    fetchArticles();
  }, [user]);

  const stats = {
    articles: myArticles.length,
    followers: 0,
    following: 0,
    likes: myArticles.reduce((sum, a) => sum + (a.likes || 0), 0),
  };

  // ✅ handleSave مربوط بالـ API
 const handleSave = async () => {
  if (!user) return;
  try {
    setIsSaving(true);

    // ✅ ارفع الصورة أولاً لو فيه صورة جديدة
    let finalAvatar = avatar;
    if (pendingAvatarFile) {
      const response = await authorService.uploadAvatar(user.id, pendingAvatarFile);
      finalAvatar = `http://localhost:5016${response.avatar}?t=${Date.now()}`;
      setAvatar(finalAvatar);
      setPendingAvatarFile(null);
    }

    // ✅ حدّث باقي البيانات
    await apiClient.put(`/Author/${user.id}`, { name, bio });
    updateProfile({ name, bio, avatar: finalAvatar });

    // ✅ حدّث localStorage
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    storedUser.name = name;
    storedUser.bio = bio;
    storedUser.avatar = finalAvatar;
    localStorage.setItem('user', JSON.stringify(storedUser));

    setIsEditing(false);
    toast.success('Profile updated successfully!');
  } catch (error) {
    toast.error('Failed to update profile');
  } finally {
    setIsSaving(false);
  }
};
  /*
  const handleSave = () => {
    updateProfile({ name, email, bio, avatar });
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };
*/
const handleCancel = () => {
  setName(user?.name || '');
  setEmail(user?.email || '');
  setBio(user?.bio || '');
  setAvatar(user?.avatar || '');
  setPendingAvatarFile(null); // ← ألغي الملف المعلّق
  setIsEditing(false);
};

  const handleDeleteAccount = async () => {
  if (!user) return;
  try {
    setIsDeletingAccount(true);
    await apiClient.delete(`/Author/${user.id}`);
    toast.success('Account deleted successfully');
    // logout المستخدم
    localStorage.clear();
    window.location.href = '/';
  } catch (error) {
    toast.error('Failed to delete account');
  } finally {
    setIsDeletingAccount(false);
    setShowDeleteConfirm(false);
  }
};


const handleAvatarChange = () => {
  fileInputRef.current?.click();
};

const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    toast.error('Please select an image file');
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    toast.error('Image must be less than 2MB');
    return;
  }

  // ✅ preview محلي فقط (blob URL)
  const previewUrl = URL.createObjectURL(file);
  setAvatar(previewUrl);
  setPendingAvatarFile(file);
  
  if (fileInputRef.current) fileInputRef.current.value = '';
};
  const handleChangePassword = async () => {
  if (!newPassword.trim() || !currentPassword.trim()) {
    toast.error('Please fill all fields');
    return;
  }
  if (newPassword !== confirmPassword) {
    toast.error('Passwords do not match');
    return;
  }
  if (newPassword.length < 6) {
    toast.error('Password must be at least 6 characters');
    return;
  }

  try {
    setIsChangingPassword(true);
    await apiClient.post('/Author/change-password', {
      currentPassword,
      newPassword,
      confirmPassword,
    });
    toast.success('Password changed successfully!');
    setShowChangePassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  } catch (error) {
    toast.error('Failed to change password — check your current password');
  } finally {
    setIsChangingPassword(false);
  }
};

  // Mock stats
  /*
  const stats = {
    articles: 12,
    followers: 243,
    following: 89,
    likes: 547,
  };
*/
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="mb-2">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your account information and preferences</p>
          </div>

          {/* Profile Card */}
          <Card className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative group">
<UserAvatar key={avatar} name={name} avatar={avatar} size="xl" />
 {isEditing && (
  <>
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      onChange={handleFileSelected}
      className="hidden"
    />
    <Button
      size="icon"
      className="absolute bottom-0 right-0 rounded-full"
      onClick={handleAvatarChange}
      disabled={isUploadingAvatar}
    >
      <Camera className="h-4 w-4" />
    </Button>
  </>
)}
</div>
                  <Badge variant="secondary">{user?.role}</Badge>
                </div>

                {/* Info Section */}
                <div className="flex-1">
                  {!isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <h2 className="mb-1">{user?.name}</h2>
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <Mail className="h-4 w-4" />
                          <span>{user?.email}</span>
                        </div>
                      </div>
                      {user?.bio && (
                        <div>
                          <Label className="text-muted-foreground">Bio</Label>
                          <p className="mt-1">{user.bio}</p>
                        </div>
                      )}
                      <Button onClick={() => setIsEditing(true)}>
                        Edit Profile
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          rows={3}
                          placeholder="Tell us about yourself..."
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSave} className="gap-2" disabled={isSaving}>
  <Save className="h-4 w-4" />
  {isSaving ? 'Saving...' : 'Save Changes'}
</Button>
                        <Button variant="outline" onClick={handleCancel}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold mb-1">{stats.articles}</div>
                <div className="text-sm text-muted-foreground">Articles</div>
              </CardContent>
            </Card>
            <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold mb-1">{stats.followers}</div>
                <div className="text-sm text-muted-foreground">Followers</div>
              </CardContent>
            </Card>
            <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-250">
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold mb-1">{stats.following}</div>
                <div className="text-sm text-muted-foreground">Following</div>
              </CardContent>
            </Card>
            <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold mb-1">{stats.likes}</div>
                <div className="text-sm text-muted-foreground">Total Likes</div>
              </CardContent>
            </Card>
          </div>

          {/* Account Information */}
          <Card className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-350">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Member Since</p>
                    <p className="text-sm text-muted-foreground">January 2026</p>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <Award className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Account Type</p>
                    <p className="text-sm text-muted-foreground capitalize">{user?.role}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          {/* Danger Zone */}
<Card className="border-destructive animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
  <CardHeader>
    <CardTitle className="text-destructive">Danger Zone</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      <div>
        <h4 className="mb-1">Change Password</h4>
        <p className="text-sm text-muted-foreground mb-3">
          Update your password to keep your account secure
        </p>
        {!showChangePassword ? (
          <Button variant="outline" onClick={() => setShowChangePassword(true)}>
            Change Password
          </Button>
        ) : (
          <div className="space-y-3 max-w-sm">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleChangePassword}
                disabled={isChangingPassword}
              >
                {isChangingPassword ? 'Saving...' : 'Save Password'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowChangePassword(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
      <Separator />
      <div>
        <h4 className="mb-1">Delete Account</h4>
        <p className="text-sm text-muted-foreground mb-3">
          Permanently delete your account and all associated data
        </p>
        
{!showDeleteConfirm ? (
  <Button
    variant="destructive"
    onClick={() => setShowDeleteConfirm(true)}
  >
    Delete Account
  </Button>
) : (
  <div className="space-y-3 p-4 border border-destructive rounded-lg">
    <p className="text-sm font-medium text-destructive">
      ⚠️ Are you sure? This action cannot be undone!
    </p>
    <p className="text-xs text-muted-foreground">
      All your articles, comments, and data will be permanently deleted.
    </p>
    <div className="flex gap-2">
      <Button
        variant="destructive"
        onClick={handleDeleteAccount}
        disabled={isDeletingAccount}
      >
        {isDeletingAccount ? 'Deleting...' : 'Yes, Delete My Account'}
      </Button>
      <Button
        variant="outline"
        onClick={() => setShowDeleteConfirm(false)}
      >
        Cancel
      </Button>
    </div>
  </div>
)}
      </div>
    </div>
  </CardContent>
</Card>
        </div>
      </div>
    </div>
  );
}
