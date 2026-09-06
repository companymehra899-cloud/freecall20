import { Mic, MicOff, Volume2, Volume1, PhoneOff } from 'lucide-react';
import { MAX_FREE_CALL_SECONDS } from '../types';

interface Props {
  partnerLabel: string;
  durationFormatted: string;
  durationSeconds: number;
  isSubscribed: boolean;
  isMuted: boolean;
  isSpeakerOn: boolean;
  onToggleMute: () => void;
  onToggleSpeaker: () => void;
  onEndCall: () => void;
}

export default function CallingScreen({
  partnerLabel,
  durationFormatted,
  durationSeconds,
  isSubscribed,
  isMuted,
  isSpeakerOn,
  onToggleMute,
  onToggleSpeaker,
  onEndCall,
}: Props) {
  const remainingSeconds = Math.max(0, MAX_FREE_CALL_SECONDS - durationSeconds);
  const remMins = Math.floor(remainingSeconds / 60);
  const remSecs = remainingSeconds % 60;
  const isWarning = remainingSeconds <= 120;

  return (
    <div className="flex-1 min-h-0 flex flex-col items-center justify-between px-6 py-6">
      <div className="flex flex-col items-center gap-2 w-full">
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1B212D] border border-[#262E3E]">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs font-medium text-[#34D399]">Live call</span>
        </div>
        <p className="text-3xl font-bold text-white tabular-nums tracking-wide">{durationFormatted}</p>
        {!isSubscribed ? (
          <div
            className={`px-3 py-1 rounded-xl border text-[11px] font-medium ${
              isWarning
                ? 'bg-[#3B1B1A] border-[#EF4444] text-[#FCA5A5]'
                : 'bg-[#1B212D] border-[#262E3E] text-[#34D399]'
            }`}
          >
            {isWarning
              ? `Free limit: ${String(remMins).padStart(2, '0')}:${String(remSecs).padStart(2, '0')} left`
              : `Free: ${String(remMins).padStart(2, '0')}:${String(remSecs).padStart(2, '0')} left`}
          </div>
        ) : (
          <div className="px-3 py-1 rounded-xl bg-[#241D0E] border border-[#F59E0B] text-[11px] font-bold text-[#FCD34D]">
            VIP PRO · Unlimited
          </div>
        )}
      </div>

      <div className="flex flex-col items-center min-w-0 w-full">
        <div className="w-24 h-24 rounded-full bg-[#13171F] border-2 border-[#262E3E] flex items-center justify-center">
          <Mic className="w-10 h-10 text-[#94A3B8]" />
        </div>
        <h2 className="text-base font-semibold text-[#F8FAFC] mt-3 max-w-[260px] truncate">{partnerLabel}</h2>
        <div className="flex items-end justify-center gap-1.5 h-10 mt-5">
          {[10, 28, 44, 20, 36, 16, 32, 22].map((h, i) => (
            <div
              key={i}
              className="w-1 bg-emerald-400 rounded-full"
              style={{
                height: isMuted ? 4 : h,
                opacity: isMuted ? 0.3 : 1,
              }}
            />
          ))}
        </div>
      </div>

      <div className="w-full grid grid-cols-3 items-end gap-2">
        <div className="flex flex-col items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleSpeaker}
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isSpeakerOn ? 'bg-[#1B212D] border border-[#262E3E] text-[#F8FAFC]' : 'bg-[#13171F] text-[#64748B]'
            }`}
            aria-label={isSpeakerOn ? 'Speaker on' : 'Earpiece'}
          >
            {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <Volume1 className="w-5 h-5" />}
          </button>
          <span className="text-[10px] text-[#94A3B8]">{isSpeakerOn ? 'Speaker' : 'Earpiece'}</span>
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <button
            type="button"
            onClick={onEndCall}
            className="w-16 h-16 rounded-full bg-[#EF4444] text-white flex items-center justify-center"
            aria-label="End call"
          >
            <PhoneOff className="w-7 h-7" />
          </button>
          <span className="text-[10px] text-[#94A3B8]">End</span>
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleMute}
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              !isMuted ? 'bg-[#1B212D] border border-[#262E3E] text-[#F8FAFC]' : 'bg-[#13171F] text-[#64748B]'
            }`}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <span className="text-[10px] text-[#94A3B8]">{isMuted ? 'Unmute' : 'Mute'}</span>
        </div>
      </div>
    </div>
  );
}
