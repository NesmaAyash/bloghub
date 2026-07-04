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

const BACKEND_URL = ((import.meta as any).env?.VITE_API_URL || 'http://localhost:5016/api').replace('/api', '');
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
  const containerClasses = `relative flex shrink-0 overflow-hidden rounded-full ring-2 ring-background shadow-md ${sizeClasses[size]} ${className}`;
 
  if (hasValidAvatar) {
    return (
      <span className={containerClasses}>
        <img
          src={fullAvatarUrl!}
          alt={name}
          className="aspect-square h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      </span>
    );
  }

  return (
    <span 
      className={containerClasses}
      style={{ backgroundColor: bgColor }}
    >
      <span className="flex h-full w-full items-center justify-center text-white font-semibold">
        {initial}
      </span>
    </span>
  );
}