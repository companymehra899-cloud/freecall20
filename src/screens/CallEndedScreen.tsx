import { Diamond, PhoneOff } from 'lucide-react';

interface Props {
  isLimitReached: boolean;
  statusMessage: string;
  onStartNextCall: () => void;
  onOpenSubscription: () => void;
}

export default function CallEndedScreen({
  isLimitReached,
  statusMessage,
  onStartNextCall,
  onOpenSubscription,
}: Props) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#090B0E]">
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center ${
          isLimitReached ? 'bg-[#241D0E] border border-[#F59E0B]' : 'bg-[#1B212D] border border-[#262E3E]'
        }`}
      >
        {isLimitReached ? (
          <Diamond className="w-8 h-8 text-[#FCD34D]" />
        ) : (
          <PhoneOff className="w-8 h-8 text-[#EF4444]" />
        )}
      </div>

      <h3 className="text-lg font-bold text-[#F8FAFC] mt-4">{statusMessage}</h3>

      {isLimitReached ? (
        <>
          <p className="text-xs text-[#94A3B8] mt-2 max-w-[300px] leading-relaxed">
            Free users get 10 mins per person/call. Calling is 100% UNLIMITED — you can immediately start
            another call with any partner, or upgrade to 5-Month Pass for non-stop conversations!
          </p>
          <button
            onClick={onStartNextCall}
            className="w-full max-w-[300px] mt-5 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold transition-all"
          >
            🎙️ Start Next Free Call
          </button>
          <button
            onClick={onOpenSubscription}
            className="w-full max-w-[300px] mt-2.5 py-3.5 rounded-2xl bg-[#1B212D] border border-[#F59E0B] text-[#FCD34D] text-xs font-semibold transition-all"
          >
            👑 Remove 20-Min Limit (₹100 / 5 Months)
          </button>
        </>
      ) : (
        <p className="text-xs text-[#64748B] mt-1.5">Returning to main screen...</p>
      )}
    </div>
  );
}
