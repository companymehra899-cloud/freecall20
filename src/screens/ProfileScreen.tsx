import { useRef } from 'react';
import { Camera, Mail, Crown, Headphones, ChevronRight, Flame } from 'lucide-react';
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) onUpdateProfileImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const subtitle = user.phoneNumber || (user.isGuest ? 'Guest Learner (Anonymous)' : user.email || 'Registered Learner');

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
      <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} className="hidden" />

      {/* User Card */}
      <div className="p-5 rounded-2xl bg-[#181d26] flex flex-col items-center">
        {/* Avatar */}
        <div onClick={() => fileInputRef.current?.click()} className="relative w-20 h-20 rounded-full cursor-pointer">
          <div
            className="w-full h-full rounded-full flex items-center justify-center overflow-hidden"
            style={{ backgroundColor: `${avatarColor}33` }}
          >
            {user.profileImageUri ? (
              <img src={user.profileImageUri} alt={user.displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold" style={{ color: '#34D399' }}>
                {user.displayName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#181d26] border-[1.5px] border-[#34D399] flex items-center justify-center">
            <Camera className="w-3.5 h-3.5 text-[#34D399]" />
          </div>
        </div>

        {/* Name + subtitle */}
        <h4 className="text-base font-bold text-white mt-3">{user.displayName}</h4>
        <p className="text-xs text-[#a0a0a0] mt-0.5">{subtitle}</p>


      </div>

      {/* Stats Row — 3 cards */}
      <div className="flex gap-3">
        <div className="flex-1 p-3.5 rounded-2xl bg-[#181d26]">
          <p className="text-[11px] text-[#a0a0a0]">Total Minutes</p>
          <p className="text-lg font-bold text-[#34D399] mt-1">{Math.floor(user.totalTalkTimeSeconds / 60)} min</p>
        </div>
        <div className="flex-1 p-3.5 rounded-2xl bg-[#181d26]">
          <p className="text-[11px] text-[#a0a0a0]">Calls Taken</p>
          <p className="text-lg font-bold text-white mt-1">{user.totalCallsMade}</p>
        </div>
        <div className="flex-1 p-3.5 rounded-2xl bg-[#181d26]">
          <p className="text-[11px] text-[#a0a0a0]">Streak</p>
          <div className="flex items-center gap-1 mt-1">
            <Flame className="w-4 h-4 text-[#ffad33]" />
            <span className="text-lg font-bold text-[#ffad33]">{user.streakDays}d</span>
          </div>
        </div>
      </div>

      {/* Settings List */}
      <div className="rounded-2xl bg-[#181d26] overflow-hidden">
        {/* Row 1: Login / Sign Up */}
        <button
          onClick={() => user.isGuest ? onOpenAuth() : undefined}
          className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors"
        >
          <Mail className="w-5 h-5 text-[#a0a0a0]" />
          <span className="flex-1 text-left text-sm text-white">
            {user.isGuest ? 'Login / Sign Up with Email' : user.email}
          </span>
          <ChevronRight className="w-4 h-4 text-[#64748B]" />
        </button>

        <div className="h-px bg-[#262E3E] mx-4" />

        {/* Row 2: Manage Subscription */}
        <button
          onClick={() => onNavigateTab('SUBSCRIPTION')}
          className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors"
        >
          <Crown className="w-5 h-5 text-[#ffad33]" />
          <span className="flex-1 text-left text-sm text-white">Manage 5-Month Subscription</span>
          <ChevronRight className="w-4 h-4 text-[#64748B]" />
        </button>

        <div className="h-px bg-[#262E3E] mx-4" />

        {/* Row 3: Echo Cancellation */}
        <div className="w-full flex items-center gap-3 px-4 py-3.5">
          <Headphones className="w-5 h-5 text-[#a0a0a0]" />
          <span className="flex-1 text-left text-sm text-white">Echo Cancellation (AEC)</span>
          <span className="text-sm font-medium text-[#34D399]">Enabled</span>
        </div>
      </div>
    </div>
  );
}
