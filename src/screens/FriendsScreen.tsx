import { useState } from 'react';
import { UserPlus, MessageSquare, Phone, Flame } from 'lucide-react';
import type { UserAccount, Friend } from '../types';
import { AVATAR_GRADIENTS } from '../types';

interface Props {
  user: UserAccount;
  friends: Friend[];
  onAddFriend: (codeOrName: string) => void;
  onDirectCallFriend: (friend: Friend) => void;
  onOpenChat: (friend: Friend) => void;
  onOpenSubscription: () => void;
  onOpenAuth: () => void;
}

export default function FriendsScreen({
  user,
  friends,
  onAddFriend,
  onDirectCallFriend,
  onOpenChat,
}: Props) {
  const [searchInput, setSearchInput] = useState('');

  const handleAdd = () => {
    if (searchInput.trim()) {
      onAddFriend(searchInput);
      setSearchInput('');
    }
  };

  const onlineCount = friends.filter(f => f.isOnline).length;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
      {/* Add Friend */}
      <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#161b22] border border-[#262E3E]">
        <input
          type="text"
          placeholder="Enter Partner ID (e.g. 1042)"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          className="flex-1 bg-[#0d1117] border border-[#262E3E] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
        <button
          onClick={handleAdd}
          className="px-3.5 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          Add
        </button>
      </div>

      {/* Buddies list header */}
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
          Speaking Buddies ({friends.length})
        </h4>
        <span className="text-xs text-emerald-400 font-bold">{onlineCount} Online Now</span>
      </div>

      {/* Buddy cards */}
      <div className="space-y-2.5">
        {friends.map(friend => {
          const avatarColor = AVATAR_GRADIENTS[friend.avatarColorIndex % AVATAR_GRADIENTS.length];
          return (
            <div
              key={friend.id}
              className="p-3.5 rounded-2xl bg-[#161b22] border border-[#262E3E] flex items-center justify-between"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ backgroundColor: avatarColor }}
                  >
                    {friend.name.charAt(0)}
                  </div>
                  {friend.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#161b22]" />
                  )}
                </div>
                {/* Info */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h5 className="text-sm font-bold text-white">{friend.name}</h5>
                    <span className="text-xs text-amber-500 font-bold flex items-center">
                      <Flame className="w-3.5 h-3.5" /> {friend.streak}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span>{friend.level}</span>
                    <span className="text-slate-600">•</span>
                    <span>{friend.location}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <button
                  onClick={() => onOpenChat(friend)}
                  className="p-2.5 rounded-xl bg-[#1B212D] text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                  title="Direct Message"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDirectCallFriend(friend)}
                  className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all"
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
