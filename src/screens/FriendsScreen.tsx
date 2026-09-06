import { useState } from 'react';
import { UserPlus, MessageSquare, Phone, Diamond, Lock } from 'lucide-react';
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
  onOpenSubscription,
  onOpenAuth,
}: Props) {
  const [searchInput, setSearchInput] = useState('');

  const handleAdd = () => {
    if (searchInput.trim()) {
      onAddFriend(searchInput);
      setSearchInput('');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-5 py-2 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-[#F8FAFC]">Speaking Friends</h3>
          <p className="text-xs text-[#64748B]">Direct 1-on-1 Voice Calling & Chat</p>
        </div>
        <div className="px-3 py-2 rounded-2xl bg-[#1B212D] border border-[#262E3E] text-right">
          <p className="text-[10px] text-[#64748B]">My Code</p>
          <p className="text-xs font-bold text-[#34D399]">{user.friendCode}</p>
        </div>
      </div>

      {/* Guest warning */}
      {user.isGuest && (
        <div className="p-4 rounded-2xl bg-[#1B212D] border border-purple-500/50 flex items-center justify-between">
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-[#A78BFA]">Login Required for Friends</h4>
            <p className="text-xs text-[#94A3B8] mt-0.5">Log in to add friends, save contacts, and make direct calls.</p>
          </div>
          <button
            onClick={onOpenAuth}
            className="px-3.5 py-2 rounded-xl bg-[#8B5CF6] text-white text-xs font-bold shrink-0 ml-3"
          >
            Login
          </button>
        </div>
      )}

      {/* Add friend input */}
      <div className="flex items-center gap-2.5">
        <input
          type="text"
          placeholder="Enter Friend Code (e.g. SPK-4821)"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          className="flex-1 bg-[#13171F] border border-[#262E3E] rounded-2xl px-4 py-3.5 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-emerald-400"
        />
        <button
          onClick={handleAdd}
          className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shrink-0"
        >
          <UserPlus className="w-5 h-5 text-black" />
        </button>
      </div>

      {/* VIP banner */}
      {!user.isSubscribed && (
        <button
          onClick={onOpenSubscription}
          className="w-full p-4 rounded-2xl bg-[#241D0E] border border-[#F59E0B]/50 flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5 text-left">
            <Diamond className="w-5 h-5 text-[#FCD34D] shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-[#FCD34D]">Unlock Direct Calling & Text Chat</h4>
              <p className="text-xs text-[#94A3B8]">₹100 for 5 Months unlimited plan</p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#FCD34D]">Upgrade ➔</span>
        </button>
      )}

      {/* Friends list */}
      <div className="space-y-2.5">
        {friends.length === 0 ? (
          <div className="text-center pt-10">
            <p className="text-sm font-semibold text-[#94A3B8]">No friends added yet</p>
            <p className="text-xs text-[#64748B] mt-1">Share your code '{user.friendCode}' with someone or add them above!</p>
          </div>
        ) : (
          friends.map(friend => {
            const avatarColor = AVATAR_GRADIENTS[friend.avatarColorIndex % AVATAR_GRADIENTS.length];
            return (
              <div key={friend.id} className="p-4 rounded-2xl bg-[#13171F] border border-[#262E3E] flex items-center justify-between">
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-bold border"
                      style={{ backgroundColor: `${avatarColor}33`, color: avatarColor, borderColor: `${avatarColor}80` }}
                    >
                      {friend.name.charAt(0).toUpperCase()}
                    </div>
                    {friend.isOnline && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#13171F]" />
                    )}
                  </div>
                  {/* Info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h5 className="text-sm font-semibold text-[#F8FAFC] truncate">{friend.name}</h5>
                      <span className="px-1.5 py-0.5 rounded bg-[#1B212D] text-[10px] text-[#64748B]">{friend.friendCode}</span>
                    </div>
                    <p className="text-xs text-[#94A3B8] mt-0.5 truncate">{friend.lastMessage}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2.5 shrink-0 ml-2">
                  <button
                    onClick={() => {
                      if (user.isGuest) onOpenAuth();
                      else if (!user.isSubscribed) onOpenSubscription();
                      else onOpenChat(friend);
                    }}
                    className="w-10 h-10 rounded-full bg-[#1B212D] border border-[#262E3E] flex items-center justify-center"
                  >
                    {user.isSubscribed ? (
                      <MessageSquare className="w-4 h-4 text-[#A78BFA]" />
                    ) : (
                      <Lock className="w-4 h-4 text-[#FCD34D]" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      if (user.isGuest) onOpenAuth();
                      else if (!user.isSubscribed) onOpenSubscription();
                      else onDirectCallFriend(friend);
                    }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                      user.isSubscribed
                        ? 'bg-emerald-500 border-[#34D399]'
                        : 'bg-[#241D0E] border-[#F59E0B]'
                    }`}
                  >
                    {user.isSubscribed ? (
                      <Phone className="w-4 h-4 text-black" />
                    ) : (
                      <Diamond className="w-4 h-4 text-[#FCD34D]" />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
