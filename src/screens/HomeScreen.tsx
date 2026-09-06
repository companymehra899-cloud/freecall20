import { useState } from 'react';
import { Mic } from 'lucide-react';
import type { UserAccount } from '../types';

interface Props {
  user: UserAccount;
  onFindPartnerClicked: () => void;
}

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const;
const TOPICS = [
  { title: 'Job Interview Practice', subtitle: 'Tell me about yourself and your strengths' },
  { title: 'Travel & Daily Routine', subtitle: 'Favorite trip and airport conversations' },
];

export default function HomeScreen({ onFindPartnerClicked }: Props) {
  const [selectedLevel, setSelectedLevel] = useState<(typeof LEVELS)[number]>('Intermediate');

  return (
    <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 pb-4">
      <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#11151F] border border-[#262E3E] mb-3">
        <img src="/logo.png" alt="SpeakFree" className="w-11 h-11 rounded-xl object-cover shrink-0" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-white truncate">SpeakFree</h1>
            <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-bold shrink-0">LIVE</span>
          </div>
          <p className="text-xs text-slate-400 truncate">Practice spoken English with real partners</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span className="text-sm font-semibold text-emerald-400 truncate">1,480+ learners online</span>
        </div>
        <span className="text-[11px] text-emerald-300 font-bold shrink-0">Instant match</span>
      </div>

      <div className="p-4 rounded-3xl bg-[#11151F] border border-[#262E3E] text-center mb-4">
        <div className="relative mx-auto w-36 h-36 mb-3">
          <div className="absolute inset-3 rounded-full border border-emerald-500/25" />
          <button
            type="button"
            onClick={onFindPartnerClicked}
            className="absolute inset-[22%] rounded-full bg-[#0F172A] border-2 border-emerald-400 flex flex-col items-center justify-center gap-1"
          >
            <Mic className="w-6 h-6 text-[#34D399]" />
            <span className="text-[11px] font-bold text-white leading-none">Find</span>
          </button>
        </div>

        <h2 className="text-base font-bold text-white">Anonymous English Practice</h2>
        <p className="text-xs text-slate-400 mt-1 leading-5">
          Tap Find to instantly talk with a random English learner.
        </p>

        <div className="mt-4 pt-3 border-t border-slate-800">
          <p className="text-xs text-slate-400 font-medium mb-2">Your level</p>
          <div className="grid grid-cols-3 gap-2">
            {LEVELS.map(level => (
              <button
                key={level}
                type="button"
                onClick={() => setSelectedLevel(level)}
                className={`h-8 rounded-lg text-[11px] font-semibold truncate px-1 ${
                  selectedLevel === level
                    ? 'bg-emerald-500 text-black'
                    : 'bg-[#1E293B] text-slate-400'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      <h3 className="text-[11px] font-bold text-slate-300 tracking-wider mb-2">TODAY'S TOPICS</h3>
      <div className="space-y-2 mb-4">
        {TOPICS.map(card => (
          <div key={card.title} className="p-3 rounded-2xl bg-[#0F172A] border border-[#262E3E] flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-white truncate">{card.title}</h4>
              <p className="text-xs text-slate-400 truncate mt-0.5">{card.subtitle}</p>
            </div>
            <button
              type="button"
              onClick={onFindPartnerClicked}
              className="h-8 px-3 rounded-xl bg-emerald-500/20 text-[#34D399] text-xs font-bold shrink-0"
            >
              Practice
            </button>
          </div>
        ))}
      </div>

      <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20">
        <h4 className="text-sm font-bold text-[#C084FC]">Daily fluency tip</h4>
        <p className="text-xs text-slate-300 leading-5 mt-1">
          Fluency comes from speaking continuously for at least 15 minutes every day. Don't pause for grammar.
        </p>
      </div>
    </div>
  );
}
