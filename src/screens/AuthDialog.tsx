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

    // Simulate auth delay
    setTimeout(() => {
      setIsLoading(false);
      onSubmitAuth(name || 'English Learner', email);
      onDismiss();
    }, 600);
  };

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[320px] bg-[#13171F] border border-[#262E3E] rounded-3xl p-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-bold text-[#F8FAFC]">
            {step === 'LOGIN' ? 'Login with Email' : 'Create Account'}
          </h3>
          <button onClick={onDismiss} className="text-[#64748B] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-[#94A3B8] mb-4">
          {step === 'LOGIN' ? 'Enter your credentials to access your account' : 'Sign up to practice English and track your progress'}
        </p>

        {errorMsg && (
          <div className="mb-3 p-3 rounded-xl bg-[#3B1B1B] border border-[#EF4444] text-xs text-[#EF4444] font-medium">
            {errorMsg}
          </div>
        )}

        <div className="space-y-3">
          {step === 'SIGNUP' && (
            <div>
              <label className="text-[11px] text-[#64748B] block mb-1">Display Name</label>
              <div className="flex items-center gap-2 bg-[#1B212D] border border-[#262E3E] rounded-xl px-3 py-2.5 focus-within:border-emerald-400">
                <UserIcon className="w-4 h-4 text-[#64748B]" />
                <input
                  type="text"
                  placeholder="e.g. Harish Singh"
                  value={nameInput}
                  onChange={e => { setNameInput(e.target.value); setErrorMsg(''); }}
                  className="flex-1 bg-transparent text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] text-[#64748B] block mb-1">Email Address</label>
            <div className="flex items-center gap-2 bg-[#1B212D] border border-[#262E3E] rounded-xl px-3 py-2.5 focus-within:border-emerald-400">
              <Mail className="w-4 h-4 text-[#64748B]" />
              <input
                type="email"
                placeholder="yourname@example.com"
                value={emailInput}
                onChange={e => { setEmailInput(e.target.value); setErrorMsg(''); }}
                className="flex-1 bg-transparent text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-[#64748B] block mb-1">Password</label>
            <div className="flex items-center gap-2 bg-[#1B212D] border border-[#262E3E] rounded-xl px-3 py-2.5 focus-within:border-emerald-400">
              <Lock className="w-4 h-4 text-[#64748B]" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={passwordInput}
                onChange={e => { setPasswordInput(e.target.value); setErrorMsg(''); }}
                className="flex-1 bg-transparent text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none"
              />
              <button onClick={() => setShowPassword(!showPassword)} className="text-[#64748B]">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-emerald-500 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-black animate-spin" />
            ) : (
              <span className="text-sm font-bold text-black">{step === 'LOGIN' ? 'Log In' : 'Sign Up'}</span>
            )}
          </button>

          <div className="flex items-center justify-center gap-1">
            <span className="text-xs text-[#64748B]">
              {step === 'LOGIN' ? 'New to SpeakFree?' : 'Already have an account?'}
            </span>
            <button
              onClick={() => { setStep(step === 'LOGIN' ? 'SIGNUP' : 'LOGIN'); setErrorMsg(''); }}
              className="text-xs font-bold text-[#34D399]"
            >
              {step === 'LOGIN' ? 'Sign Up' : 'Log In'}
            </button>
          </div>

          <button onClick={onDismiss} className="w-full text-xs text-[#64748B] hover:text-[#94A3B8] py-1">
            Continue as Guest without login
          </button>
        </div>
      </div>
    </div>
  );
}
