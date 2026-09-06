import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Phone, Send, Lock } from 'lucide-react';
import type { UserAccount, Friend, ChatMessage } from '../types';
import { AVATAR_GRADIENTS } from '../types';

interface Props {
  user: UserAccount;
  friend: Friend;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onDirectCall: () => void;
  onBack: () => void;
  onOpenSubscription: () => void;
}

export default function DirectChatScreen({
  user,
  friend,
  messages,
  onSendMessage,
  onDirectCall,
  onBack,
  onOpenSubscription,
}: Props) {
  const [textInput, setTextInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const avatarColor = AVATAR_GRADIENTS[friend.avatarColorIndex % AVATAR_GRADIENTS.length];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = () => {
    if (textInput.trim()) {
      onSendMessage(textInput);
      setTextInput('');
    }
  };

  return (
    <div className="absolute inset-0 bg-[#090B0E] z-40 flex flex-col">
      <div className="flex items-center gap-2 px-3 h-14 bg-[#13171F] border-b border-[#262E3E] shrink-0">
        <button type="button" onClick={onBack} className="w-9 h-9 flex items-center justify-center shrink-0" aria-label="Back">
          <ArrowLeft className="w-5 h-5 text-[#F8FAFC]" />
        </button>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border shrink-0"
          style={{ backgroundColor: `${avatarColor}33`, color: avatarColor, borderColor: '#10B981' }}
        >
          {friend.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-[#F8FAFC] truncate">{friend.name}</h2>
          <p className="text-[10px] text-[#94A3B8] truncate">
            {friend.isOnline ? 'Online' : 'Offline'} · {friend.friendCode}
          </p>
        </div>
        <button
          type="button"
          onClick={onDirectCall}
          className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shrink-0"
          aria-label={`Call ${friend.name}`}
        >
          <Phone className="w-5 h-5 text-black" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map(msg => {
          const isMe = msg.senderId === user.userId;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 ${
                  isMe ? 'bg-emerald-500 rounded-br-md' : 'bg-[#1B212D] border border-[#262E3E] rounded-bl-md'
                }`}
              >
                <p className={`text-sm break-words leading-5 ${isMe ? 'text-black' : 'text-[#F8FAFC]'}`}>{msg.text}</p>
                <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-black/60' : 'text-[#64748B]'}`}>
                  {msg.timeFormatted}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {!user.isSubscribed ? (
        <button
          type="button"
          onClick={onOpenSubscription}
          className="w-full px-4 py-3 bg-[#241D0E] border-t border-[#F59E0B]/50 flex items-center gap-2.5 shrink-0"
        >
          <Lock className="w-4 h-4 text-[#FCD34D] shrink-0" />
          <span className="text-xs font-semibold text-[#FCD34D] text-left min-w-0 flex-1 leading-5">
            Unlock chat with VIP · ₹100 / 5 mo
          </span>
        </button>
      ) : (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-[#13171F] border-t border-[#262E3E] shrink-0">
          <input
            type="text"
            placeholder="Type a message..."
            value={textInput}
            onChange={e => setTextInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            className="flex-1 min-w-0 h-11 bg-[#1B212D] border border-[#262E3E] rounded-full px-4 text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-emerald-400"
          />
          <button
            type="button"
            onClick={handleSend}
            className="w-11 h-11 rounded-full bg-emerald-500 flex items-center justify-center shrink-0"
            aria-label="Send"
          >
            <Send className="w-5 h-5 text-black" />
          </button>
        </div>
      )}
    </div>
  );
}
