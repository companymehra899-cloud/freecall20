import { Diamond } from 'lucide-react';
import type { UserAccount, AppTab } from '../types';

interface Props {
  user: UserAccount;
  onNavigateTab: (tab: AppTab) => void;
}

export default function AppTopBar({ user, onNavigateTab }: Props) {
  return (
    <header className="flex items-center justify-between gap-3 px-4 pt-3 pb-2 shrink-0">
      <button
        type="button"
        onClick={() => onNavigateTab('PROFILE')}
        className="flex items-center gap-2 min-w-0 h-9 px-3 rounded-full bg-[#1B212D] border border-[#262E3E]"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
        <span className="text-xs font-semibold text-[#F8FAFC] truncate max-w-[120px]">
          {user.isGuest ? 'Profile' : user.displayName}
        </span>
      </button>

      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1 h-9 px-2.5 rounded-full bg-[#1B212D] border border-[#262E3E]">
          <span className="text-xs leading-none">Streak</span>
          <span className="text-xs font-bold text-[#FCD34D]">{user.streakDays}</span>
        </div>
        <button
          type="button"
          onClick={() => onNavigateTab('SUBSCRIPTION')}
          className="flex items-center gap-1 h-9 px-3 rounded-full bg-[#241D0E] border border-[#F59E0B] text-[#FCD34D]"
        >
          <Diamond className="w-3 h-3 shrink-0" />
          <span className="text-[11px] font-bold whitespace-nowrap">
            {user.isSubscribed ? 'VIP PRO' : '5-Mo Plan'}
          </span>
        </button>
      </div>
    </header>
  );
}
