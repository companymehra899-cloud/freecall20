import { Home, Users, Diamond, User } from 'lucide-react';
import type { AppTab } from '../types';

interface Props {
  currentTab: AppTab;
  onTabSelected: (tab: AppTab) => void;
  hasSubscribed: boolean;
}

const TABS: Array<{ key: AppTab; label: string; icon: typeof Home; special?: boolean }> = [
  { key: 'HOME', label: 'Home', icon: Home },
  { key: 'FRIENDS', label: 'Friends', icon: Users },
  { key: 'SUBSCRIPTION', label: '5-Mo PRO', icon: Diamond, special: true },
  { key: 'PROFILE', label: 'Profile', icon: User },
];

export default function AppBottomBar({ currentTab, onTabSelected, hasSubscribed }: Props) {
  return (
    <div className="px-3 pb-2 pt-1 shrink-0 z-10">
      <div className="flex items-center justify-between rounded-3xl bg-[#13171F] border border-[#262E3E] px-1 py-1.5">
        {TABS.map(({ key, label, icon: Icon, special }) => {
          const isSelected = currentTab === key;
          const activeColor = special ? 'text-[#FCD34D]' : 'text-[#34D399]';
          return (
            <button
              key={key}
              onClick={() => onTabSelected(key)}
              className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  isSelected
                    ? special
                      ? 'bg-[#241D0E] border border-[#F59E0B]'
                      : 'bg-[#1B212D] border border-emerald-500/50'
                    : 'border border-transparent'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${isSelected ? activeColor : 'text-[#64748B]'}`}
                  strokeWidth={isSelected ? 2.5 : 2}
                />
              </div>
              <span
                className={`text-[10px] font-semibold ${
                  isSelected ? 'text-[#F8FAFC]' : 'text-[#64748B]'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
