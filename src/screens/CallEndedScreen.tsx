import { Diamond, PhoneOff } from 'lucide-react';

interface Props {
  isLimitReached: boolean;
  statusMessage: string;
  onStartNextCall: () => void;
  onOpenSubscription: () => void;
  onDone: () => void;
}

export default function CallEndedScreen({
  isLimitReached,
  statusMessage,
  onStartNextCall,
  onOpenSubscription,
  onDone,
}: Props) {
  return (
    <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-6 text-center">
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

      <h2 className="text-lg font-bold text-[#F8FAFC] mt-4 px-2">{statusMessage}</h2>

      {isLimitReached ? (
        <>
          <p className="text-xs text-[#94A3B8] mt-2 max-w-[300px] leading-5">
            Free users get 10 minutes per call. You can start another call now, or upgrade for unlimited duration.
          </p>
          <button
            type="button"
            onClick={onStartNextCall}
            className="w-full max-w-[300px] mt-5 h-12 rounded-2xl bg-emerald-500 text-black text-sm font-bold"
          >
            Start next free call
          </button>
          <button
            type="button"
            onClick={onOpenSubscription}
            className="w-full max-w-[300px] mt-2.5 h-12 rounded-2xl bg-[#1B212D] border border-[#F59E0B] text-[#FCD34D] text-xs font-semibold"
          >
            Remove 10-min limit · ₹100 / 5 months
          </button>
        </>
      ) : (
        <>
          <p className="text-xs text-[#64748B] mt-1.5">Ready for the next practice session.</p>
          <button
            type="button"
            onClick={onDone}
            className="w-full max-w-[300px] mt-5 h-12 rounded-2xl bg-emerald-500 text-black text-sm font-bold"
          >
            Back to home
          </button>
        </>
      )}
    </div>
  );
}
