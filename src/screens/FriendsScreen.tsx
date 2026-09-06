import { useState } from 'react';
import { UserPlus, MessageSquare, Phone } from 'lucide-react';
import type { UserAccount, Friend } from '../types';
import { AVATAR_GRADIENTS } from '../types';

interface Props {
  user: UserAccount;
  friends: Friend[];
  onAddFriend: (codeOrName: string) => void;
  onDirectCallFriend: (friend: Friend) => void;
  onOpenChat: (friend: Friend) => void;
  billingMessage: string | null;
  onDismissBillingMessage: () => void;
}

export default function FriendsScreen({
  friends,
  onAddFriend,
  onDirectCallFriend,
  onOpenChat,
  billingMessage,
  onDismissBillingMessage,
}: Props) {
  const [searchInput, setSearchInput] = useState('');
  const onlineCount = friends.filter(f => f.isOnline).length;

  const handleAdd = () => {
    if (searchInput.trim()) {
      onAddFriend(searchInput);
      setSearchInput('');
    }
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 pb-4">
      {billingMessage && (
        <button
          type="button"
          onClick={onDismissBillingMessage}
          className="w-full mb-3 p-3 rounded-xl bg-[#2A1C16] border border-[#E06C45] text-left"
        >
          <p className="text-xs text-[#FDE8E1] leading-5">{billingMessage}</p>
        </button>
      )}

      <div className="flex items-center gap-2 p-2 rounded-2xl bg-[#161b22] border border-[#262E3E] mb-4">
        <input
          type="text"
          placeholder="Partner ID or name"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          className="flex-1 min-w-0 h-9 bg-[#0d1117] border border-[#262E3E] rounded-xl px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="h-9 px-3 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold flex items-center gap-1 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          Add
        </button>
      </div>

      <div className="flex items-center justify-between gap-2 mb-3">
        <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider truncate">
          Speaking buddies ({friends.length})
        </h2>
        <span className="text-xs text-emerald-400 font-bold shrink-0">{onlineCount} online</span>
      </div>

      <div className="space-y-2">
        {friends.map(friend => {
          const avatarColor = AVATAR_GRADIENTS[friend.avatarColorIndex % AVATAR_GRADIENTS.length];
          return (
            <div
              key={friend.id}
              className="p-3 rounded-2xl bg-[#161b22] border border-[#262E3E] flex items-center gap-3"
            >
              <div className="relative shrink-0">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ backgroundColor: avatarColor }}
                >
                  {friend.name.charAt(0)}
                </div>
                {friend.isOnline && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#161b22]" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-white truncate">{friend.name}</h3>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {friend.level} · {friend.location} · {friend.streak}d
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onOpenChat(friend)}
                  className="w-9 h-9 rounded-xl bg-[#1B212D] text-slate-300 flex items-center justify-center"
                  aria-label={`Chat with ${friend.name}`}
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDirectCallFriend(friend)}
                  className="h-9 px-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Call
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
