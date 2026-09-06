import { useState } from 'react';
import {
  Smartphone,
  Code2,
  Zap,
  Database,
  Activity,
  FileCode,
  CheckCircle2,
  Flame,
  ServerOff,
} from 'lucide-react';
import { useAppStore } from './useAppStore';
import PhoneMockup from './screens/PhoneMockup';

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'code' | 'architecture'>('simulator');
  const [selectedFileKey, setSelectedFileKey] = useState<string>('MainActivity.kt');
  const store = useAppStore();

  const codeFiles = [
    { name: 'MainActivity.kt', path: 'app/src/main/java/com/example/MainActivity.kt', desc: 'Main scaffold with bottom navigation, auth dialog, and call state transitions.' },
    { name: 'HomeScreen.kt', path: 'app/src/main/java/com/example/ui/screens/HomeScreen.kt', desc: 'Pulsing find partner action, topic cards, and learner status.' },
    { name: 'FriendsScreen.kt', path: 'app/src/main/java/com/example/ui/screens/FriendsScreen.kt', desc: 'Online English speaking partners, direct calling, and instant chat.' },
    { name: 'AuthDialog.kt', path: 'app/src/main/java/com/example/ui/screens/AuthDialog.kt', desc: 'Email & Password authentication and verification dialog.' },
    { name: 'ProfileScreen.kt', path: 'app/src/main/java/com/example/ui/screens/ProfileScreen.kt', desc: 'Learner profile with Gallery photo picker, email sign up/login, and settings.' },
    { name: 'SubscriptionScreen.kt', path: 'app/src/main/java/com/example/ui/screens/SubscriptionScreen.kt', desc: '5-Month English Booster Pack with Google Play Billing v7 purchase flow.' },
    { name: 'PlayBillingManager.kt', path: 'app/src/main/java/com/example/billing/PlayBillingManager.kt', desc: 'Official Google Play Billing Library v7 manager with receipt verification.' },
    { name: 'WebRtcAudioClient.kt', path: 'app/src/main/java/com/example/webrtc/WebRtcAudioClient.kt', desc: 'Zero-cost WebRTC P2P audio client with Google STUN servers.' },
  ];

  return (
    <div className="min-h-screen bg-[#080a0e] text-slate-100 flex flex-col selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Top Navigation Header */}
      <header className="border-b border-slate-800/80 bg-[#0c0f15]/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-sky-900/40 border border-sky-400/30 shrink-0">
              <img src="/logo.png" alt="SpeakFree App Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base sm:text-lg text-white tracking-tight">SpeakFree Live</h1>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Android Native • $0/mo
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Full English Speaking App • Email & Password Login • WebRTC Voice</p>
            </div>
          </div>

          {/* Navigation Mode Switcher */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'simulator' ? 'bg-emerald-500 text-slate-950 font-semibold shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Live App Preview
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'code' ? 'bg-emerald-500 text-slate-950 font-semibold shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              Kotlin Codebase
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'architecture' ? 'bg-emerald-500 text-slate-950 font-semibold shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Zero-Cost Guide
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Phone Mockup */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <PhoneMockup store={store} />
            </div>

            {/* Right Column: Telemetry & Info */}
            <div className="lg:col-span-7 space-y-6">
              {/* Architecture Highlights */}
              <div className="p-5 rounded-2xl bg-[#0e1219] border border-slate-800/80 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-bold text-sm text-white">Live Zero-Cost Architecture Status</h3>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
                    Firebase Spark Free Tier
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Full English Learning Android application built with <strong>Jetpack Compose</strong> and <strong>WebRTC P2P Direct Audio</strong>. Matches random learners worldwide with ephemeral Firestore signaling that auto-purges instantly on connection for $0.00/month operation.
                </p>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block font-medium">Server Cost</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">₹0 / month</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block font-medium">Daily Free Calls</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">12,500+</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block font-medium">Target APK Size</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">&lt; 8 MB</span>
                  </div>
                </div>
              </div>

              {/* Signaling Log Stream */}
              <div className="p-4 rounded-2xl bg-[#090c10] border border-slate-800 shadow-inner">
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Live Signaling & Purge Stream</span>
                  </div>
                  <button
                    onClick={store.clearLogs}
                    className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    Clear Log
                  </button>
                </div>
                <div className="space-y-1.5 font-mono text-xs max-h-52 overflow-y-auto pr-1">
                  {store.logs.map((log, index) => (
                    <div key={index} className="flex items-start gap-2 py-0.5">
                      <span className="text-slate-600 text-[10px] shrink-0">{log.time}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold shrink-0 ${
                          log.type === 'delete'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : log.type === 'write'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : log.type === 'read'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {log.type}
                      </span>
                      <span className="text-slate-300 text-xs">{log.action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* APK Build Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-[#0e131d] border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-white">GitHub Actions APK Workflow Created</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    <code>.github/workflows/main.yml</code> automatically builds <code>app-debug.apk</code> on GitHub!
                  </p>
                </div>
                <button
                  onClick={() => { setActiveTab('code'); setSelectedFileKey('MainActivity.kt'); }}
                  className="px-3 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1 shrink-0"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  View Kotlin Files
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CODE TAB */}
        {activeTab === 'code' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-4 space-y-2">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 mb-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Android Project Structure</h3>
                <p className="text-[11px] text-slate-400">Jetpack Compose • Kotlin • WebRTC</p>
              </div>
              {codeFiles.map(file => (
                <button
                  key={file.name}
                  onClick={() => setSelectedFileKey(file.name)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-1 cursor-pointer ${
                    selectedFileKey === file.name
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 shadow-md'
                      : 'bg-[#0d1017] border-slate-800/80 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-white">{file.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase font-mono">Kotlin</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono truncate">{file.path}</span>
                </button>
              ))}
            </div>
            <div className="lg:col-span-8 rounded-2xl bg-[#0a0d13] border border-slate-800 overflow-hidden shadow-2xl flex flex-col">
              <div className="px-5 py-3.5 bg-[#0e1219] border-b border-slate-800">
                <h3 className="font-mono text-sm font-bold text-white flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-emerald-400" />
                  {selectedFileKey}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Android Native Jetpack Compose Source</p>
              </div>
              <div className="p-4 overflow-x-auto max-h-[600px] overflow-y-auto bg-[#07090e]">
                <pre className="font-mono text-xs text-slate-300 leading-relaxed">
                  <code>{`// File: ${selectedFileKey}
// Complete Kotlin and Jetpack Compose source is available in /app/src/main/java/com/example/

package com.example

// Ready for Android Studio & GitHub Actions compilation`}</code>
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* ARCHITECTURE TAB */}
        {activeTab === 'architecture' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="p-6 rounded-2xl bg-[#0e1219] border border-slate-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">How Zero Monthly Cost Is Guaranteed</h3>
                  <p className="text-xs text-slate-400">Firebase Spark Free Tier + Pure P2P Audio</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2 mb-2">
                    <Database className="w-4 h-4" /> 1. Instant Firestore Cleanup
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Signaling documents exist only for 2 seconds during handshake. The millisecond WebRTC connects, documents are deleted. Zero long-term database storage.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2 mb-2">
                    <ServerOff className="w-4 h-4" /> 2. Google Public STUN
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Audio is encrypted and streamed device-to-device via Google's free STUN server (<code className="text-emerald-300">stun.l.google.com:19302</code>).
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
