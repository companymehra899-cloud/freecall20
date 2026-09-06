import { Home, Users, Diamond, User } from 'lucide-react';
import type { AppTab } from '../types';

interface Props {
  currentTab: AppTab;
  onTabSelected: (tab: AppTab) => void;
}

const TABS: Array<{ key: AppTab; label: string; icon: typeof Home; special?: boolean }> = [
  { key: 'HOME', label: 'Home', icon: Home },
  { key: 'FRIENDS', label: 'Friends', icon: Users },
  { key: 'SUBSCRIPTION', label: 'PRO', icon: Diamond, special: true },
  { key: 'PROFILE', label: 'Profile', icon: User },
];

export default function AppBottomBar({ currentTab, onTabSelected }: Props) {
  return (
    <nav className="px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 shrink-0">
      <div className="grid grid-cols-4 items-center rounded-2xl bg-[#13171F] border border-[#262E3E] px-1 py-1">
        {TABS.map(({ key, label, icon: Icon, special }) => {
          const isSelected = currentTab === key;
          const activeColor = special ? 'text-[#FCD34D]' : 'text-[#34D399]';
          return (
            <button
              key={key}
              type="button"
              onClick={() => onTabSelected(key)}
              className="flex flex-col items-center justify-center gap-0.5 h-14 rounded-xl"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isSelected
                    ? special
                      ? 'bg-[#241D0E] border border-[#F59E0B]'
                      : 'bg-[#1B212D] border border-emerald-500/50'
                    : ''
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${isSelected ? activeColor : 'text-[#64748B]'}`}
                  strokeWidth={isSelected ? 2.5 : 2}
                />
              </div>
              <span
                className={`text-[10px] font-semibold leading-none ${
                  isSelected ? 'text-[#F8FAFC]' : 'text-[#64748B]'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
