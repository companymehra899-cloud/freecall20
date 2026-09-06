import { useRef } from 'react';
import { Camera, Mail, Crown, Headphones, ChevronRight, LogOut } from 'lucide-react';
import type { UserAccount, AppTab } from '../types';
import { AVATAR_GRADIENTS } from '../types';

interface Props {
  user: UserAccount;
  onOpenAuth: () => void;
  onLogout: () => void;
  onNavigateTab: (tab: AppTab) => void;
  onUpdateProfileImage: (uri: string | null) => void;
}

export default function ProfileScreen({ user, onOpenAuth, onLogout, onNavigateTab, onUpdateProfileImage }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarColor = AVATAR_GRADIENTS[user.avatarColorIndex % AVATAR_GRADIENTS.length];
  const subtitle = user.isGuest ? 'Guest learner' : (user.email || 'Registered learner');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = event => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) onUpdateProfileImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 pb-4">
      <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} className="hidden" />

      <div className="p-5 rounded-2xl bg-[#181d26] flex flex-col items-center mb-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="relative w-20 h-20 rounded-full"
          aria-label="Change profile photo"
        >
          <div
            className="w-full h-full rounded-full flex items-center justify-center overflow-hidden"
            style={{ backgroundColor: `${avatarColor}33` }}
          >
            {user.profileImageUri ? (
              <img src={user.profileImageUri} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-[#34D399]">
                {user.displayName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#181d26] border border-[#34D399] flex items-center justify-center">
            <Camera className="w-3.5 h-3.5 text-[#34D399]" />
          </span>
        </button>
        <h2 className="text-base font-bold text-white mt-3 text-center truncate max-w-full px-2">{user.displayName}</h2>
        <p className="text-xs text-[#a0a0a0] mt-0.5 truncate max-w-full px-2">{subtitle}</p>
        <p className="text-[11px] text-slate-500 mt-1 font-mono">{user.friendCode}</p>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="p-3 rounded-2xl bg-[#181d26] min-w-0">
          <p className="text-[11px] text-[#a0a0a0] truncate">Minutes</p>
          <p className="text-lg font-bold text-[#34D399] mt-1 truncate">{Math.floor(user.totalTalkTimeSeconds / 60)}</p>
        </div>
        <div className="p-3 rounded-2xl bg-[#181d26] min-w-0">
          <p className="text-[11px] text-[#a0a0a0] truncate">Calls</p>
          <p className="text-lg font-bold text-white mt-1 truncate">{user.totalCallsMade}</p>
        </div>
        <div className="p-3 rounded-2xl bg-[#181d26] min-w-0">
          <p className="text-[11px] text-[#a0a0a0] truncate">Streak</p>
          <p className="text-lg font-bold text-[#ffad33] mt-1 truncate">{user.streakDays}d</p>
        </div>
      </div>

      <div className="rounded-2xl bg-[#181d26] overflow-hidden mb-3">
        <button
          type="button"
          onClick={() => { if (user.isGuest) onOpenAuth(); }}
          className="w-full flex items-center gap-3 px-4 h-12"
        >
          <Mail className="w-5 h-5 text-[#a0a0a0] shrink-0" />
          <span className="flex-1 text-left text-sm text-white truncate">
            {user.isGuest ? 'Login / Sign up' : user.email}
          </span>
          {user.isGuest && <ChevronRight className="w-4 h-4 text-[#64748B] shrink-0" />}
        </button>
        <div className="h-px bg-[#262E3E] mx-4" />
        <button
          type="button"
          onClick={() => onNavigateTab('SUBSCRIPTION')}
          className="w-full flex items-center gap-3 px-4 h-12"
        >
          <Crown className="w-5 h-5 text-[#ffad33] shrink-0" />
          <span className="flex-1 text-left text-sm text-white truncate">Manage subscription</span>
          <ChevronRight className="w-4 h-4 text-[#64748B] shrink-0" />
        </button>
        <div className="h-px bg-[#262E3E] mx-4" />
        <div className="w-full flex items-center gap-3 px-4 h-12">
          <Headphones className="w-5 h-5 text-[#a0a0a0] shrink-0" />
          <span className="flex-1 text-left text-sm text-white truncate">Echo cancellation</span>
          <span className="text-sm font-medium text-[#34D399] shrink-0">On</span>
        </div>
      </div>

      {!user.isGuest && (
        <button
          type="button"
          onClick={onLogout}
          className="w-full h-12 rounded-2xl bg-[#1B212D] border border-[#262E3E] text-sm font-semibold text-red-400 flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      )}
    </div>
  );
}
