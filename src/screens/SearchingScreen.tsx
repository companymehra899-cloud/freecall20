import { AudioLines } from 'lucide-react';
import type { CallState } from '../types';

interface Props {
  callState: CallState;
  searchingSeconds: number;
  statusMessage: string;
  onCancelClicked: () => void;
}

export default function SearchingScreen({ callState, searchingSeconds, statusMessage, onCancelClicked }: Props) {
  const isConnecting = callState === 'CONNECTING';

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-6 bg-[#090B0E]">
      {/* Status badge */}
      <div className="mt-6 px-3.5 py-1.5 rounded-2xl bg-[#13171F] border border-[#262E3E]">
        <span className="text-xs text-[#94A3B8]">
          {isConnecting ? 'Connecting to live call...' : 'Looking for available speaker'}
        </span>
      </div>

      {/* Radar animation */}
      <div className="relative flex items-center justify-center w-56 h-56">
        <div
          className="absolute w-40 h-40 rounded-full border-2 border-emerald-400/20 animate-ping"
          style={{ animationDuration: '2.2s' }}
        />
        <div className="absolute w-36 h-36 rounded-full border border-emerald-400/30 animate-pulse" />
        <div className="w-24 h-24 rounded-full bg-[#1B212D] border-2 border-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <AudioLines className="w-9 h-9 text-[#34D399]" />
        </div>
      </div>

      {/* Text + Cancel */}
      <div className="flex flex-col items-center w-full">
        <h3 className="text-lg font-bold text-[#F8FAFC]">
          {isConnecting ? 'Connecting...' : 'Searching for Partner...'}
        </h3>
        <p className="text-sm text-[#94A3B8] mt-1 mb-5">
          {isConnecting ? statusMessage : `${searchingSeconds}s elapsed`}
        </p>
        <button
          onClick={onCancelClicked}
          className="w-full py-3.5 rounded-2xl bg-[#1B212D] border border-[#262E3E] text-sm font-medium text-[#94A3B8] hover:text-white transition-all"
        >
          Cancel Search
        </button>
      </div>
    </div>
  );
}
