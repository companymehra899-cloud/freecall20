import { useRef } from 'react';
import { Camera, Diamond, Phone, Timer, LogOut, User as UserIcon } from 'lucide-react';
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

  return (
    <div className="flex-1 overflow-y-auto px-5 py-2 space-y-4">
      <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} className="hidden" />

      <h3 className="text-xl font-bold text-[#F8FAFC] mt-2">My Profile</h3>

      {/* Avatar card */}
      <div className="p-5 rounded-3xl bg-[#13171F] border border-[#262E3E] flex flex-col items-center">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative w-20 h-20 rounded-full cursor-pointer"
        >
          <div
            className="w-full h-full rounded-full flex items-center justify-center overflow-hidden border-[3px]"
            style={{
              backgroundColor: `${avatarColor}33`,
              borderColor: user.isSubscribed ? '#F59E0B' : '#34D399',
            }}
          >
            {user.profileImageUri ? (
              <img src={user.profileImageUri} alt={user.displayName} className="w-full h-full object-cover" />
            ) : (
              <span
                className="text-3xl font-bold"
                style={{ color: user.isSubscribed ? '#FCD34D' : '#34D399' }}
              >
                {user.displayName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#1B212D] border-[1.5px] border-[#34D399] flex items-center justify-center">
            <Camera className="w-3.5 h-3.5 text-[#34D399]" />
          </div>
        </div>

        {user.profileImageUri && (
          <button
            onClick={() => onUpdateProfileImage(null)}
            className="text-[11px] text-[#EF4444] mt-2 px-2 py-1 rounded-md hover:bg-red-500/10"
          >
            Remove Photo
          </button>
        )}

        <div className="flex items-center justify-center gap-2 mt-3">
          <h4 className="text-lg font-bold text-[#F8FAFC]">{user.displayName}</h4>
          {user.isSubscribed && (
            <span className="px-2 py-0.5 rounded-md bg-[#241D0E] border border-[#F59E0B] text-[10px] font-bold text-[#FCD34D]">
              VIP PRO
            </span>
          )}
        </div>
        <p className="text-xs text-[#64748B] mt-1">
          {user.phoneNumber || (user.isGuest ? 'Guest Learner (Anonymous)' : user.email || 'Registered Learner')}
        </p>
      </div>

      {/* Stats */}
      <div className="flex gap-3">
        <div className="flex-1 p-4 rounded-2xl bg-[#13171F] border border-[#262E3E]">
          <Phone className="w-6 h-6 text-[#34D399]" />
          <p className="text-lg font-bold text-[#F8FAFC] mt-2.5">{user.totalCallsMade}</p>
          <p className="text-xs text-[#64748B]">Calls Practiced</p>
        </div>
        <div className="flex-1 p-4 rounded-2xl bg-[#13171F] border border-[#262E3E]">
          <Timer className="w-6 h-6 text-[#A78BFA]" />
          <p className="text-lg font-bold text-[#F8FAFC] mt-2.5">{Math.floor(user.totalTalkTimeSeconds / 60)}m</p>
          <p className="text-xs text-[#64748B]">Speaking Time</p>
        </div>
      </div>

      {/* VIP banner */}
      <button
        onClick={() => onNavigateTab('SUBSCRIPTION')}
        className="w-full p-4 rounded-2xl flex items-center justify-between"
        style={{
          backgroundColor: user.isSubscribed ? '#241D0E' : '#13171F',
          border: `1px solid ${user.isSubscribed ? '#F59E0B' : '#262E3E'}`,
        }}
      >
        <div className="flex items-center gap-3 text-left">
          <Diamond className="w-6 h-6 text-[#FCD34D]" />
          <div>
            <h5 className="text-sm font-bold text-[#FCD34D]">
              {user.isSubscribed ? 'VIP 5-Month Pass (Active)' : '₹100 5-Months VIP Plan'}
            </h5>
            <p className="text-xs text-[#94A3B8]">
              {user.isSubscribed ? `Expires: ${user.subscriptionExpiryDate}` : 'Direct friend calling & text chat'}
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-[#FCD34D]">{user.isSubscribed ? 'Details ➔' : 'Upgrade ➔'}</span>
      </button>

      {/* Login / Logout */}
      {user.isGuest ? (
        <button
          onClick={onOpenAuth}
          className="w-full py-3.5 rounded-2xl bg-emerald-500 flex items-center justify-center gap-2"
        >
          <UserIcon className="w-5 h-5 text-black" />
          <span className="text-sm font-bold text-black">Login / Sign Up</span>
        </button>
      ) : (
        <button
          onClick={onLogout}
          className="w-full py-3.5 rounded-2xl bg-[#1B212D] border border-[#262E3E] flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5 text-[#EF4444]" />
          <span className="text-sm font-semibold text-[#EF4444]">Logout (Switch to Guest)</span>
        </button>
      )}

      <p className="text-xs text-[#64748B] text-center pb-2">SpeakFree v1.0 • HD Voice Connection</p>
    </div>
  );
}
