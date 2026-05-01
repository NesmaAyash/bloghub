import { useState, useEffect } from 'react';
import { getAvatarColor, getInitial } from '../utils/avatar';

interface UserAvatarProps {
  name: string;
  avatar?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-12 w-12 text-lg',
  xl: 'h-32 w-32 text-4xl',
};

const BACKEND_URL = 'http://localhost:5016';

// ✅ تحويل المسار النسبي إلى URL كامل
function getFullAvatarUrl(avatar?: string | null): string | null {
  if (!avatar || avatar.trim() === '') return null;
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) return avatar;
  if (avatar.startsWith('blob:')) return avatar; // للـ preview المحلي
  if (avatar.startsWith('/')) return `${BACKEND_URL}${avatar}`;
  return avatar;
}

export function UserAvatar({ name, avatar, size = 'md', className = '' }: UserAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [avatar]);

  const sizeClass = sizeClasses[size];
  const bgColor = getAvatarColor(name);
  const initial = getInitial(name);
  const fullAvatarUrl = getFullAvatarUrl(avatar);

  const hasValidAvatar =
    fullAvatarUrl &&
    !fullAvatarUrl.includes('dicebear') &&
    !imageFailed;

  if (hasValidAvatar) {
    return (
      <img
        src={fullAvatarUrl}
        alt={name}
        className={`${sizeClass} rounded-full object-cover ${className}`}
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center text-white font-semibold ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      {initial}
    </div>
  );
}