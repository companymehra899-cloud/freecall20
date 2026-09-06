import { useState } from 'react';
import { Mic, Star } from 'lucide-react';
import type { UserAccount } from '../types';

interface Props {
  user: UserAccount;
  onFindPartnerClicked: () => void;
}

export default function HomeScreen({ onFindPartnerClicked }: Props) {
  const [selectedLevel, setSelectedLevel] = useState('Intermediate');

  return (
    <div className="flex-1 overflow-y-auto px-4 py-2.5 space-y-4">
      {/* Brand card */}
      <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-gradient-to-r from-sky-950/40 via-slate-900/60 to-slate-900/40 border border-sky-500/20">
        <img src="/logo.png" alt="SpeakFree" className="w-12 h-12 rounded-2xl border border-sky-400/30 object-cover shrink-0" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-white">SpeakFree</h4>
            <span className="px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 text-[10px] font-bold border border-sky-500/30">Live P2P</span>
          </div>
          <p className="text-xs text-slate-400 truncate mt-0.5">Practice spoken English with real partners</p>
        </div>
      </div>

      {/* Live online badge */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
        <div className="flex items-center gap-2.5 text-emerald-400 font-semibold text-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>1,480+ Learners Active Online</span>
        </div>
        <span className="text-xs text-emerald-300 font-mono font-bold">Instant Match</span>
      </div>

      {/* Find partner pulse action */}
      <div className="p-5 rounded-3xl bg-gradient-to-b from-[#11151F] to-[#0D1017] border border-[#262E3E] text-center flex flex-col items-center">
        <div className="relative flex items-center justify-center w-44 h-44 my-2">
          <div className="absolute w-40 h-40 rounded-full bg-emerald-500/10 animate-ping" style={{ animationDuration: '3s' }} />
          <div className="absolute w-32 h-32 rounded-full border border-emerald-500/30 animate-pulse" />
          <button
            onClick={onFindPartnerClicked}
            className="relative w-26 h-26 rounded-full bg-gradient-to-b from-[#1E293B] to-[#0F172A] border-2 border-emerald-400 shadow-lg shadow-emerald-500/20 flex flex-col items-center justify-center gap-1 cursor-pointer hover:scale-105 active:scale-95 transition-all"
          >
            <Mic className="w-7 h-7 text-[#34D399]" />
            <span className="text-xs font-bold text-white">Find Partner</span>
          </button>
        </div>

        <h3 className="text-base font-bold text-white">Anonymous English Practice</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
          Tap button above to instantly talk with a random English learner worldwide.
        </p>

        {/* Level selector */}
        <div className="w-full mt-4 pt-3.5 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">Your Level:</span>
          <div className="flex items-center gap-2">
            {['Beginner', 'Intermediate', 'Advanced'].map(level => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedLevel === level
                    ? 'bg-emerald-500 text-black font-bold'
                    : 'bg-[#1E293B] text-slate-400 hover:text-white'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Topic cards */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">TODAY'S TOPIC CARDS</h4>
          <span className="text-xs text-slate-400">Icebreakers</span>
        </div>
        {[
          { title: '💼 Job Interview Practice', subtitle: '"Tell me about yourself & your strengths"' },
          { title: '✈️ Travel & Daily Routine', subtitle: '"Favorite trip & airport conversations"' },
        ].map(card => (
          <div key={card.title} className="p-3.5 rounded-2xl bg-[#0F172A] border border-[#262E3E] flex items-center justify-between">
            <div className="min-w-0">
              <h5 className="text-sm font-bold text-white">{card.title}</h5>
              <p className="text-xs text-slate-400 mt-0.5 truncate">{card.subtitle}</p>
            </div>
            <button
              onClick={onFindPartnerClicked}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-[#34D399] text-xs font-bold hover:bg-emerald-500 hover:text-black transition-all shrink-0 ml-2"
            >
              Practice
            </button>
          </div>
        ))}
      </div>

      {/* Daily tip */}
      <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex gap-3">
        <Star className="w-5 h-5 text-[#C084FC] shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-[#C084FC]">Daily Fluency Tip</h4>
          <p className="text-xs text-slate-300 leading-relaxed mt-1">
            Don't worry about making grammatical mistakes! Fluency comes from speaking continuously for at least 15 minutes every day.
          </p>
        </div>
      </div>
    </div>
  );
}
