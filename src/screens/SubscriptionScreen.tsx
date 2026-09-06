import { Diamond, CheckCircle, Phone, MessageSquare, Star, Zap, ShoppingBag, ShieldCheck, Loader2 } from 'lucide-react';
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
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <Diamond className="w-6 h-6 text-[#FCD34D]" />
        <h3 className="text-xl font-bold text-[#F8FAFC]">SpeakFree VIP Pass</h3>
      </div>
      <p className="text-xs text-[#94A3B8] -mt-3">Connect directly with friends & practice unlimited speaking</p>

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
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#2E230B] to-[#1E1707] border border-[#F59E0B]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-5 h-5 text-[#FCD34D]" />
              <span className="text-base font-bold text-[#FCD34D]">VIP PRO ACTIVE</span>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-[#F59E0B] text-black text-[10px] font-bold">5-MONTH PASS</span>
          </div>
          <div className="mt-4 text-center">
            <p className="text-xs text-[#64748B]">Subscription Valid Until</p>
            <p className="text-xl font-bold text-[#F8FAFC] mt-1">{user.subscriptionExpiryDate || '5 Months Active'}</p>
            {user.googlePlayOrderId && (
              <p className="text-[10px] text-[#FCD34D]/70 mt-1.5">Google Play Order: {user.googlePlayOrderId}</p>
            )}
          </div>
          <p className="text-xs text-[#94A3B8] text-center mt-3">
            Unlocked: Unlimited Non-Stop Call Duration & Direct Friend Chat!
          </p>
        </div>
      ) : (
        <div className="p-5 rounded-3xl bg-gradient-to-b from-[#271F0C] to-[#171307] border-2 border-[#F59E0B] text-center">
          <div className="inline-block px-3.5 py-1.5 rounded-full bg-[#F59E0B]">
            <span className="text-xs font-bold text-black">⭐ OFFICIAL GOOGLE PLAY PASS</span>
          </div>
          <div className="flex items-baseline justify-center gap-1 mt-4">
            <span className="text-4xl font-bold text-[#FCD34D]">₹100</span>
            <span className="text-sm text-[#94A3B8]">/ 5 Months</span>
          </div>
          <p className="text-xs text-[#FCD34D]/85 mt-2">Just ₹20 per month • Official Google Play In-App Subscription</p>
        </div>
      )}

      {/* Benefits checklist */}
      <div className="p-4 rounded-2xl bg-[#13171F] border border-[#262E3E] space-y-4">
        <h4 className="text-sm font-bold text-[#F8FAFC]">Everything Included in VIP Plan:</h4>
        {[
          { icon: Phone, color: '#34D399', title: 'Unlimited Non-Stop Call Duration', desc: 'No 10-minute call disconnects. Practice for as long as you desire.' },
          { icon: MessageSquare, color: '#A78BFA', title: 'Direct Friend Calling & Chat', desc: 'Directly call and text message favorite study buddies anytime.' },
          { icon: Star, color: '#FCD34D', title: 'Verified VIP Crown Badge', desc: 'Distinguished crown badge on your profile and incoming call screens.' },
          { icon: Zap, color: '#10B981', title: 'Priority HD Low-Latency Audio', desc: 'Real-time WebRTC audio connection with lowest latency.' },
        ].map(b => (
          <div key={b.title} className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${b.color}26` }}>
              <b.icon className="w-5 h-5" style={{ color: b.color }} />
            </div>
            <div>
              <h5 className="text-sm font-semibold text-[#F8FAFC]">{b.title}</h5>
              <p className="text-xs text-[#94A3B8] mt-0.5">{b.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Google Play CTA */}
      {!user.isSubscribed && (
        <div className="p-4 rounded-2xl bg-[#1B212D] border border-[#262E3E] flex flex-col items-center">
          <div className="flex items-center gap-2 mb-3.5">
            <ShoppingBag className="w-4 h-4 text-[#34D399]" />
            <span className="text-xs font-semibold text-[#34D399]">Google Play In-App Purchase</span>
          </div>
          <button
            onClick={() => (user.isGuest ? onOpenAuth() : onSubscribeGooglePlay())}
            disabled={isBillingProcessing}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#F59E0B] to-[#D97706] flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isBillingProcessing ? (
              <>
                <Loader2 className="w-5 h-5 text-black animate-spin" />
                <span className="text-sm font-bold text-black">Connecting to Google Play...</span>
              </>
            ) : (
              <>
                <Diamond className="w-5 h-5 text-black" />
                <span className="text-sm font-bold text-black">
                  {user.isGuest ? 'Log In to Subscribe (₹100 / 5 Mo)' : 'Subscribe with Google Play'}
                </span>
              </>
            )}
          </button>
          <p className="text-[10px] text-[#64748B] text-center mt-3 leading-relaxed">
            🔒 Managed securely by Google Play. Instant activation upon purchase receipt verification. Cancel anytime in Google Play Store subscriptions.
          </p>
        </div>
      )}
    </div>
  );
}
