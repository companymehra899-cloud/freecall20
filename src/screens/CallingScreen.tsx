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
    <div className="flex-1 flex flex-col items-center justify-between px-6 pt-4 pb-6 bg-[#090B0E]">
      {/* Top: Live Call badge + timer */}
      <div className="flex flex-col items-center gap-2 mt-2">
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1B212D] border border-[#262E3E]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-medium text-[#34D399]">Live Call</span>
        </div>

        {!isSubscribed ? (
          <div
            className={`px-3 py-1 rounded-xl border text-[11px] font-medium ${
              isWarning
                ? 'bg-[#3B1B1A] border-[#EF4444] text-[#FCA5A5]'
                : 'bg-[#1B212D] border-[#262E3E] text-[#34D399]'
            }`}
          >
            {isWarning
              ? `⚠️ Free Limit: ${String(remMins).padStart(2, '0')}:${String(remSecs).padStart(2, '0')} left`
              : `⏱️ Free: ${String(remMins).padStart(2, '0')}:${String(remSecs).padStart(2, '0')} left`}
          </div>
        ) : (
          <div className="px-3 py-1 rounded-xl bg-[#241D0E] border border-[#F59E0B] text-[11px] font-bold text-[#FCD34D]">
            👑 VIP PRO: Unlimited Duration
          </div>
        )}
      </div>

      {/* Center: Partner + waveform */}
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-[#13171F] border-2 border-[#262E3E] flex items-center justify-center">
          <Mic className="w-10 h-10 text-[#94A3B8]" />
        </div>
        <h4 className="text-base font-semibold text-[#F8FAFC] mt-3 max-w-[260px] truncate">{partnerLabel}</h4>

        {/* Voice bars */}
        <div className="flex items-center gap-1.5 h-10 mt-5">
          {[10, 28, 44, 20, 36, 16, 32, 22].map((h, i) => (
            <div
              key={i}
              className="w-1 bg-emerald-400 rounded-full animate-pulse"
              style={{
                height: isMuted ? '4px' : `${h}px`,
                opacity: isMuted ? 0.3 : 1,
                animationDelay: `${i * 80}ms`,
                animationDuration: '600ms',
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="w-full flex items-center justify-around">
        {/* Speaker toggle */}
        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={onToggleSpeaker}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isSpeakerOn
                ? 'bg-[#1B212D] border border-[#262E3E] text-[#F8FAFC]'
                : 'bg-[#13171F] text-[#64748B]'
            }`}
          >
            {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <Volume1 className="w-5 h-5" />}
          </button>
          <span className="text-[10px] text-[#94A3B8]">{isSpeakerOn ? 'Speaker' : 'Earpiece'}</span>
        </div>

        {/* End call */}
        <button
          onClick={onEndCall}
          className="w-16 h-16 rounded-full bg-[#EF4444] hover:bg-[#DC2626] text-white flex items-center justify-center shadow-lg shadow-red-500/40 transition-transform active:scale-95"
        >
          <PhoneOff className="w-7 h-7" />
        </button>

        {/* Mute toggle */}
        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={onToggleMute}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              !isMuted
                ? 'bg-[#1B212D] border border-[#262E3E] text-[#F8FAFC]'
                : 'bg-[#13171F] text-[#64748B]'
            }`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <span className="text-[10px] text-[#94A3B8]">{isMuted ? 'Unmute' : 'Mute'}</span>
        </div>
      </div>
    </div>
  );
}
