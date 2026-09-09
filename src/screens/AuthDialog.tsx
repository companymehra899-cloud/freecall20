import { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, Eye, EyeOff, Loader2 } from 'lucide-react';
import type { AuthStep } from '../types';

interface Props {
  onDismiss: () => void;
  onSubmitAuth: (name: string, email: string) => void;
}

export default function AuthDialog({ onDismiss, onSubmitAuth }: Props) {
  const [step, setStep] = useState<AuthStep>('LOGIN');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = () => {
    const email = emailInput.trim();
    const password = passwordInput.trim();
    const name = nameInput.trim();

    if (!email || !password) {
      setErrorMsg('Please fill in all fields');
      return;
    }
    if (!email.includes('@')) {
      setErrorMsg('Enter a valid email');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }
    if (step === 'SIGNUP' && !name) {
      setErrorMsg('Please enter your name');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setTimeout(() => {
      setIsLoading(false);
      onSubmitAuth(name, email);
    }, 600);
  };

  return (
    <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[340px] bg-[#13171F] border border-[#262E3E] rounded-3xl p-5">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h2 className="text-lg font-bold text-[#F8FAFC] leading-6">
            {step === 'LOGIN' ? 'Login with email' : 'Create account'}
          </h2>
          <button type="button" onClick={onDismiss} className="w-8 h-8 flex items-center justify-center text-[#64748B] shrink-0" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-[#94A3B8] mb-4 leading-5">
          {step === 'LOGIN' ? 'Enter your credentials to access your account' : 'Sign up to track progress and unlock VIP'}
        </p>

        {errorMsg && (
          <div className="mb-3 p-3 rounded-xl bg-[#3B1B1B] border border-[#EF4444] text-xs text-[#EF4444] font-medium leading-5">
            {errorMsg}
          </div>
        )}

        <div className="space-y-3">
          {step === 'SIGNUP' && (
            <div>
              <label className="text-[11px] text-[#64748B] block mb-1">Display name</label>
              <div className="flex items-center gap-2 bg-[#1B212D] border border-[#262E3E] rounded-xl px-3 h-11">
                <UserIcon className="w-4 h-4 text-[#64748B] shrink-0" />
                <input
                  type="text"
                  placeholder="e.g. Harish Singh"
                  value={nameInput}
                  onChange={e => { setNameInput(e.target.value); setErrorMsg(''); }}
                  className="flex-1 min-w-0 bg-transparent text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] text-[#64748B] block mb-1">Email address</label>
            <div className="flex items-center gap-2 bg-[#1B212D] border border-[#262E3E] rounded-xl px-3 h-11">
              <Mail className="w-4 h-4 text-[#64748B] shrink-0" />
              <input
                type="email"
                placeholder="you@example.com"
                value={emailInput}
                onChange={e => { setEmailInput(e.target.value); setErrorMsg(''); }}
                className="flex-1 min-w-0 bg-transparent text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-[#64748B] block mb-1">Password</label>
            <div className="flex items-center gap-2 bg-[#1B212D] border border-[#262E3E] rounded-xl px-3 h-11">
              <Lock className="w-4 h-4 text-[#64748B] shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={passwordInput}
                onChange={e => { setPasswordInput(e.target.value); setErrorMsg(''); }}
                className="flex-1 min-w-0 bg-transparent text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-[#64748B] shrink-0" aria-label="Toggle password">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full h-12 rounded-2xl bg-emerald-500 flex items-center justify-center disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-black animate-spin" />
            ) : (
              <span className="text-sm font-bold text-black">{step === 'LOGIN' ? 'Log in' : 'Sign up'}</span>
            )}
          </button>

          <div className="flex items-center justify-center gap-1 flex-wrap">
            <span className="text-xs text-[#64748B]">
              {step === 'LOGIN' ? 'New to SpeakFree?' : 'Already have an account?'}
            </span>
            <button
              type="button"
              onClick={() => { setStep(step === 'LOGIN' ? 'SIGNUP' : 'LOGIN'); setErrorMsg(''); }}
              className="text-xs font-bold text-[#34D399]"
            >
              {step === 'LOGIN' ? 'Sign up' : 'Log in'}
            </button>
          </div>

          <button type="button" onClick={onDismiss} className="w-full text-xs text-[#64748B] py-1">
            Continue as guest
          </button>
        </div>
      </div>
    </div>
  );
}
