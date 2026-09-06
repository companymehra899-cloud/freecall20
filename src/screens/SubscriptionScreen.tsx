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

export default function SubscriptionScreen({
  user,
  isBillingProcessing,
  billingMessage,
  onSubscribeGooglePlay,
  onOpenAuth,
  onDismissBillingMessage,
}: Props) {
  return (
    <div className="flex-1 overflow-y-auto px-5 py-3 space-y-5">
      {/* Billing alert */}
      {billingMessage && (
        <div
          onClick={onDismissBillingMessage}
          className="p-4 rounded-2xl bg-[#2A1C16] border border-[#E06C45] flex items-center gap-2.5 cursor-pointer"
        >
          <ShieldCheck className="w-5 h-5 text-[#FFA07A] shrink-0" />
          <p className="text-xs text-[#FDE8E1] flex-1">{billingMessage}</p>
          <span className="text-sm text-[#64748B]">✕</span>
        </div>
      )}

      {/* Active VIP or Plan card */}
      {user.isSubscribed ? (
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#2E230B] to-[#1E1707] border border-[#eab308]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Check className="w-5 h-5 text-emerald-400" />
              <span className="text-base font-bold text-[#FCD34D]">VIP PRO ACTIVE</span>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-[#F59E0B] text-black text-[10px] font-bold">5-MONTH PASS</span>
          </div>
          <div className="mt-4 text-center py-2.5 bg-slate-950/70 rounded-2xl border border-amber-500/20">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Subscription Valid Until</p>
            <p className="text-lg font-bold text-white mt-1">{user.subscriptionExpiryDate || '5 Months Active'}</p>
            {user.googlePlayOrderId && (
              <p className="text-[10px] text-amber-400/90 font-mono mt-1">Order: {user.googlePlayOrderId}</p>
            )}
          </div>
          <p className="text-xs text-emerald-300 text-center mt-3 font-semibold">
            ✓ Verified Google Play Purchase Receipt Active
          </p>
        </div>
      ) : (
        <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-950 border border-[#eab308] text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30 mb-2.5">
            <Crown className="w-4 h-4" />
            <span>OFFICIAL GOOGLE PLAY PASS</span>
          </div>

          {/* Heading */}
          <h3 className="text-lg font-extrabold text-white">5-Month English Booster Pack</h3>

          {/* Pricing */}
          <div className="my-2.5 flex items-baseline justify-center gap-2">
            <span className="text-3xl font-black text-amber-400">₹100</span>
            <span className="text-sm text-slate-400 line-through">₹499</span>
            <span className="text-xs text-emerald-400 font-extrabold">80% OFF</span>
          </div>
          <p className="text-xs text-slate-200">Just ₹20/month for 5 Full Months of Unlimited Voice Practice</p>

          {/* CTA */}
          <button
            onClick={() => (user.isGuest ? onOpenAuth() : onSubscribeGooglePlay())}
            disabled={isBillingProcessing}
            className="w-full mt-4 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-60"
          >
            {isBillingProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Connecting to Google Play...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current" />
                <span>Subscribe with Google Play (₹100 / 5 Mo)</span>
              </>
            )}
          </button>
          <p className="text-xs text-slate-400 mt-2.5">
            🔒 Google Play Billing Library v7 • Instant receipt verification
          </p>
        </div>
      )}

      {/* What's included */}
      <div className="p-4 rounded-2xl bg-[#1e293b] border border-slate-800">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">What's included in VIP Pass:</h4>
        <div className="space-y-2.5 text-xs text-slate-200">
          {[
            'Unlimited Non-Stop Call Duration (No 10-min cut)',
            'Direct Friend Audio Calling & Text Chat',
            'Verified VIP Crown Badge on Profile',
            'Priority HD Low-Latency Audio Stream',
          ].map(item => (
            <div key={item} className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
