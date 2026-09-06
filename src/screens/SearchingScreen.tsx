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
    <div className="flex-1 min-h-0 flex flex-col items-center justify-between p-6">
      <div className="mt-4 px-3.5 py-1.5 rounded-2xl bg-[#13171F] border border-[#262E3E]">
        <span className="text-xs text-[#94A3B8]">
          {isConnecting ? 'Connecting to live call...' : 'Looking for an available speaker'}
        </span>
      </div>

      <div className="relative flex items-center justify-center w-48 h-48">
        <div className="absolute w-36 h-36 rounded-full border border-emerald-400/30" />
        <div className="w-24 h-24 rounded-full bg-[#1B212D] border-2 border-emerald-400 flex items-center justify-center">
          <AudioLines className="w-9 h-9 text-[#34D399]" />
        </div>
      </div>

      <div className="flex flex-col items-center w-full">
        <h2 className="text-lg font-bold text-[#F8FAFC] text-center">
          {isConnecting ? 'Connecting...' : 'Searching for partner...'}
        </h2>
        <p className="text-sm text-[#94A3B8] mt-1 mb-5 text-center min-h-5">
          {isConnecting ? statusMessage : `${searchingSeconds}s elapsed`}
        </p>
        <button
          type="button"
          onClick={onCancelClicked}
          className="w-full h-12 rounded-2xl bg-[#1B212D] border border-[#262E3E] text-sm font-medium text-[#94A3B8]"
        >
          Cancel search
        </button>
      </div>
    </div>
  );
}
