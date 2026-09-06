import { Crown, Zap, Check, ShieldCheck, Loader2 } from 'lucide-react';
import type { UserAccount } from '../types';

interface Props {
  user: UserAccount;
  isBillingProcessing: boolean;
  billingMessage: string | null;
  onSubscribeGooglePlay: () => void;
  onOpenAuth: () => void;
  onDismissBillingMessage: () => void;
}

const INCLUDED = [
  'Unlimited call duration (no 10-min cut)',
  'Direct friend audio calling and text chat',
  'VIP badge on your profile',
  'Priority low-latency audio',
];

export default function SubscriptionScreen({
  user,
  isBillingProcessing,
  billingMessage,
  onSubscribeGooglePlay,
  onOpenAuth,
  onDismissBillingMessage,
}: Props) {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 pb-4">
      {billingMessage && (
        <button
          type="button"
          onClick={onDismissBillingMessage}
          className="w-full mb-3 p-3 rounded-2xl bg-[#2A1C16] border border-[#E06C45] text-left flex items-start gap-2"
        >
          <ShieldCheck className="w-4 h-4 text-[#FFA07A] shrink-0 mt-0.5" />
          <p className="text-xs text-[#FDE8E1] leading-5 min-w-0">{billingMessage}</p>
        </button>
      )}

      {user.isSubscribed ? (
        <div className="p-5 rounded-3xl bg-[#1E1707] border border-[#eab308] mb-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Check className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-base font-bold text-[#FCD34D] truncate">VIP PRO active</span>
            </div>
            <span className="px-2 py-1 rounded-lg bg-[#F59E0B] text-black text-[10px] font-bold shrink-0">5 MONTHS</span>
          </div>
          <div className="mt-4 text-center py-3 bg-black/40 rounded-2xl border border-amber-500/20">
            <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Valid until</p>
            <p className="text-lg font-bold text-white mt-1">{user.subscriptionExpiryDate || '5 months'}</p>
            {user.googlePlayOrderId && (
              <p className="text-[10px] text-amber-400/90 font-mono mt-1 truncate px-3">Order: {user.googlePlayOrderId}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-3xl bg-[#11151F] border border-[#eab308] text-center mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30 mb-3">
            <Crown className="w-4 h-4 shrink-0" />
            <span>Google Play pass</span>
          </div>
          <h2 className="text-lg font-extrabold text-white leading-6">5-Month English Booster</h2>
          <div className="my-3 flex items-baseline justify-center gap-2 flex-wrap">
            <span className="text-3xl font-black text-amber-400">₹100</span>
            <span className="text-sm text-slate-400 line-through">₹499</span>
            <span className="text-xs text-emerald-400 font-extrabold">80% OFF</span>
          </div>
          <p className="text-xs text-slate-300 leading-5">₹20/month for 5 months of unlimited voice practice</p>
          <button
            type="button"
            onClick={() => (user.isGuest ? onOpenAuth() : onSubscribeGooglePlay())}
            disabled={isBillingProcessing}
            className="w-full mt-4 h-12 rounded-2xl bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isBillingProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Subscribe · ₹100 / 5 mo</span>
              </>
            )}
          </button>
          {user.isGuest && (
            <p className="text-xs text-slate-400 mt-2">Sign in first to complete purchase.</p>
          )}
        </div>
      )}

      <div className="p-4 rounded-2xl bg-[#1e293b] border border-slate-800">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Included in VIP</h3>
        <div className="space-y-2.5">
          {INCLUDED.map(item => (
            <div key={item} className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-xs text-slate-200 leading-5">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
