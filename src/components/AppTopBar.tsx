import { Diamond } from 'lucide-react';
import type { UserAccount, AppTab } from '../types';

interface Props {
  user: UserAccount;
  onNavigateTab: (tab: AppTab) => void;
}

export default function AppTopBar({ user, onNavigateTab }: Props) {
  return (
    <div className="flex items-center justify-between px-4 py-3 shrink-0 z-10">
      {/* Profile pill */}
      <button
        onClick={() => onNavigateTab('PROFILE')}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1B212D] border border-[#262E3E] text-xs font-medium text-[#F8FAFC] hover:border-emerald-500/50 transition-colors"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
        <span>Profile</span>
      </button>

      {/* Streak + Plan */}
      <div className="flex items-center gap-2">
        {/* Streak badge */}
        <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#1B212D] border border-[#262E3E]">
          <span className="text-[11px]">🔥</span>
          <span className="text-xs font-bold text-[#FCD34D]">{user.streakDays}</span>
        </div>

        {/* 5-Mo Plan / VIP PRO */}
        <button
          onClick={() => onNavigateTab('SUBSCRIPTION')}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#241D0E] border border-[#F59E0B] text-[#FCD34D] text-[11px] font-bold hover:brightness-110 transition-all"
        >
          <Diamond className="w-3 h-3" />
          <span>{user.isSubscribed ? '👑 VIP PRO' : '5-Mo Plan'}</span>
        </button>
      </div>
    </div>
  );
}
