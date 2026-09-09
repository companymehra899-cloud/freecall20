import { useState, useRef, useCallback, useEffect } from 'react';
import type { UserAccount, Friend, ChatMessage, CallState, AppTab } from './types';
import { MAX_FREE_CALL_SECONDS } from './types';

const INITIAL_FRIENDS: Friend[] = [
  {
    id: '1042',
    friendCode: 'SPK-4821',
    name: 'Aarav Sharma',
    isOnline: true,
    avatarColorIndex: 1,
    lastMessage: "Hey! Let's practice IELTS speaking topics today?",
    lastMessageTime: '12:30 PM',
    level: 'Intermediate',
    streak: 7,
    location: 'Mumbai, IN',
  },
  {
    id: '3910',
    friendCode: 'SPK-8923',
    name: 'Priya Patel',
    isOnline: true,
    avatarColorIndex: 2,
    lastMessage: 'Thanks for the great conversation earlier!',
    lastMessageTime: 'Yesterday',
    level: 'Advanced',
    streak: 14,
    location: 'Ahmedabad, IN',
  },
  {
    id: '5582',
    friendCode: 'SPK-3109',
    name: 'Vikram Singh',
    isOnline: false,
    avatarColorIndex: 0,
    lastMessage: 'Will be online at 8 PM for mock interview.',
    lastMessageTime: '2 days ago',
    level: 'Beginner',
    streak: 4,
    location: 'Jaipur, IN',
  },
  {
    id: '8821',
    friendCode: 'SPK-8821',
    name: 'Anaya Roy',
    isOnline: false,
    avatarColorIndex: 4,
    lastMessage: "Let's practice tomorrow!",
    lastMessageTime: '3 days ago',
    level: 'Intermediate',
    streak: 12,
    location: 'Kolkata, IN',
  },
];

function createGuestUser(): UserAccount {
  const id = crypto.randomUUID();
  return {
    userId: id,
    displayName: `Guest #${id.slice(0, 4).toUpperCase()}`,
    phoneNumber: '',
    email: '',
    friendCode: `SPK-${Math.floor(1000 + Math.random() * 9000)}`,
    isGuest: true,
    isSubscribed: false,
    subscriptionExpiryDate: '',
    googlePlayOrderId: '',
    streakDays: 3,
    avatarColorIndex: Math.floor(Math.random() * 5),
    profileImageUri: localStorage.getItem('speakfree_profile_image') || null,
    totalCallsMade: 3,
    totalTalkTimeSeconds: 184,
  };
}

function seedChats(userId: string): Record<string, ChatMessage[]> {
  return {
    '1042': [
      { id: 'm1', senderId: '1042', senderName: 'Aarav Sharma', text: 'Hi there! Are you free for a 10-minute speaking drill?', timeFormatted: '11:45 AM' },
      { id: 'm2', senderId: userId, senderName: 'Me', text: "Yes, sure! Let's discuss business idioms and accent clarity.", timeFormatted: '12:15 PM' },
      { id: 'm3', senderId: '1042', senderName: 'Aarav Sharma', text: "Hey! Let's practice IELTS speaking topics today?", timeFormatted: '12:30 PM' },
    ],
  };
}

export interface AppStore {
  user: UserAccount;
  friends: Friend[];
  currentTab: AppTab;
  showAuthDialog: boolean;
  activeChatFriend: Friend | null;
  activeChatMessages: ChatMessage[];
  callState: CallState;
  callDurationFormatted: string;
  callDurationSeconds: number;
  isFreeLimitReached: boolean;
  searchingSeconds: number;
  isMuted: boolean;
  isSpeakerOn: boolean;
  partnerLabel: string;
  statusMessage: string;
  isBillingProcessing: boolean;
  billingMessage: string | null;
  logs: Array<{ time: string; action: string; type: 'write' | 'read' | 'delete' | 'info' }>;
  selectTab: (tab: AppTab) => void;
  openAuthDialog: () => void;
  closeAuthDialog: () => void;
  loginWithEmail: (name: string, email: string) => void;
  logout: () => void;
  updateProfileImage: (uri: string | null) => void;
  addFriend: (codeOrName: string) => void;
  openChatWithFriend: (friend: Friend) => void;
  closeChat: () => void;
  sendChatMessage: (text: string) => void;
  findPartner: () => void;
  startDirectCallWithFriend: (friend: Friend) => void;
  cancelSearch: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleSpeaker: () => void;
  launchGooglePlayPurchase: () => void;
  clearBillingMessage: () => void;
  clearLogs: () => void;
  dismissCallEnded: () => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function useAppStore(): AppStore {
  const [user, setUser] = useState<UserAccount>(createGuestUser);
  const [friends, setFriends] = useState<Friend[]>(INITIAL_FRIENDS);
  const [currentTab, setCurrentTab] = useState<AppTab>('HOME');
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [activeChatFriend, setActiveChatFriend] = useState<Friend | null>(null);
  const [activeChatMessages, setActiveChatMessages] = useState<ChatMessage[]>([]);
  const [callState, setCallState] = useState<CallState>('IDLE');
  const [callDurationFormatted, setCallDurationFormatted] = useState('00:00');
  const [callDurationSeconds, setCallDurationSeconds] = useState(0);
  const [isFreeLimitReached, setIsFreeLimitReached] = useState(false);
  const [searchingSeconds, setSearchingSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [partnerLabel, setPartnerLabel] = useState('Anonymous Partner');
  const [statusMessage, setStatusMessage] = useState('');
  const [isBillingProcessing, setIsBillingProcessing] = useState(false);
  const [billingMessage, setBillingMessage] = useState<string | null>(null);
  const [logs, setLogs] = useState<Array<{ time: string; action: string; type: 'write' | 'read' | 'delete' | 'info' }>>([
    { time: '09:14:02.120', action: 'App initialized', type: 'info' },
  ]);

  const chatStoreRef = useRef<Record<string, ChatMessage[]>>({});
  const searchTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const callTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const connectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const replyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeChatFriendIdRef = useRef<string | null>(null);
  const callSecondsRef = useRef(0);
  const subscribedRef = useRef(false);

  useEffect(() => {
    chatStoreRef.current = seedChats(user.userId);
  }, []);

  useEffect(() => {
    subscribedRef.current = user.isSubscribed;
  }, [user.isSubscribed]);

  const addLog = useCallback((action: string, type: 'write' | 'read' | 'delete' | 'info') => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
    setLogs(prev => [{ time: timeStr, action, type }, ...prev.slice(0, 19)]);
  }, []);

  const clearTimers = useCallback(() => {
    if (searchTimerRef.current) {
      clearInterval(searchTimerRef.current);
      searchTimerRef.current = null;
    }
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    if (connectTimeoutRef.current) {
      clearTimeout(connectTimeoutRef.current);
      connectTimeoutRef.current = null;
    }
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }
  }, []);

  const startCallTimer = useCallback(() => {
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    callSecondsRef.current = 0;
    setCallDurationSeconds(0);
    setCallDurationFormatted('00:00');
    setIsFreeLimitReached(false);

    callTimerRef.current = setInterval(() => {
      callSecondsRef.current += 1;
      const seconds = callSecondsRef.current;
      setCallDurationSeconds(seconds);
      setCallDurationFormatted(formatDuration(seconds));

      if (!subscribedRef.current && seconds >= MAX_FREE_CALL_SECONDS) {
        if (callTimerRef.current) clearInterval(callTimerRef.current);
        callTimerRef.current = null;
        setIsFreeLimitReached(true);
        setCallState('ENDED');
        setStatusMessage('Free 10-min call limit reached');
        addLog('Free 10-min call limit reached. Call disconnected.', 'info');
        setUser(prev => ({
          ...prev,
          totalCallsMade: prev.totalCallsMade + 1,
          totalTalkTimeSeconds: prev.totalTalkTimeSeconds + seconds,
        }));
      }
    }, 1000);
  }, [addLog]);

  const resetToIdle = useCallback(() => {
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }
    setCallState('IDLE');
    setCallDurationFormatted('00:00');
    setCallDurationSeconds(0);
    callSecondsRef.current = 0;
    setPartnerLabel('Anonymous Partner');
    setStatusMessage('');
    setIsFreeLimitReached(false);
    setSearchingSeconds(0);
  }, []);

  const dismissCallEnded = resetToIdle;

  const findPartner = useCallback(() => {
    clearTimers();
    setCallState('SEARCHING');
    setSearchingSeconds(0);
    setIsMuted(false);
    setIsSpeakerOn(true);
    setIsFreeLimitReached(false);
    setPartnerLabel('Anonymous Partner');
    setStatusMessage('Matching you with an English learner...');
    addLog('Matchmaking request started', 'info');

    let count = 0;
    searchTimerRef.current = setInterval(() => {
      count += 1;
      setSearchingSeconds(count);

      if (count === 3) {
        if (searchTimerRef.current) clearInterval(searchTimerRef.current);
        searchTimerRef.current = null;
        setCallState('CONNECTING');
        const partners = ['Rahul Verma (Delhi)', 'Simran Kaur (Chandigarh)', 'Amit Deshmukh (Pune)', 'Kavya Nair (Kerala)'];
        const chosen = partners[Math.floor(Math.random() * partners.length)];
        const randId = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase();
        setPartnerLabel(`Learner #${randId}`);
        addLog(`Match found: ${chosen}`, 'info');

        connectTimeoutRef.current = setTimeout(() => {
          setCallState('IN_CALL');
          addLog('P2P audio connected', 'info');
          startCallTimer();
        }, 1200);
      }
    }, 1000);
  }, [addLog, startCallTimer, clearTimers]);

  const startDirectCallWithFriend = useCallback((friend: Friend) => {
    clearTimers();
    setPartnerLabel(friend.name);
    setCallState('CONNECTING');
    setIsMuted(false);
    setIsSpeakerOn(true);
    setIsFreeLimitReached(false);
    setStatusMessage(`Connecting to ${friend.name}...`);
    addLog(`Direct call: ${friend.name}`, 'write');

    connectTimeoutRef.current = setTimeout(() => {
      setCallState('IN_CALL');
      addLog(`P2P audio connected with ${friend.name}`, 'info');
      startCallTimer();
    }, 1500);
  }, [addLog, startCallTimer, clearTimers]);

  const cancelSearch = useCallback(() => {
    clearTimers();
    setCallState('IDLE');
    setSearchingSeconds(0);
    setPartnerLabel('Anonymous Partner');
    setStatusMessage('');
    addLog('Search cancelled', 'delete');
  }, [addLog, clearTimers]);

  const endCall = useCallback(() => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    const talkSeconds = callSecondsRef.current;
    addLog('Call ended', 'info');
    if (talkSeconds > 0) {
      setUser(prev => ({
        ...prev,
        totalCallsMade: prev.totalCallsMade + 1,
        totalTalkTimeSeconds: prev.totalTalkTimeSeconds + talkSeconds,
      }));
    }
    setCallState('ENDED');
    setIsFreeLimitReached(false);
    setStatusMessage('Call completed');
  }, [addLog]);

  const toggleMute = useCallback(() => setIsMuted(prev => !prev), []);
  const toggleSpeaker = useCallback(() => setIsSpeakerOn(prev => !prev), []);

  const loginWithEmail = useCallback((name: string, email: string) => {
    const cleanEmail = email.trim();
    const fallbackName = cleanEmail.split('@')[0] || 'English Learner';
    setUser(prev => ({
      ...prev,
      displayName: name.trim() || prev.displayName || fallbackName,
      email: cleanEmail,
      isGuest: false,
    }));
    setShowAuthDialog(false);
    addLog(`Signed in as ${cleanEmail}`, 'read');
  }, [addLog]);

  const logout = useCallback(() => {
    setUser(createGuestUser());
    setCurrentTab('HOME');
    addLog('Logged out. Guest mode.', 'info');
  }, [addLog]);

  const updateProfileImage = useCallback((uri: string | null) => {
    setUser(prev => ({ ...prev, profileImageUri: uri }));
    if (uri) {
      try { localStorage.setItem('speakfree_profile_image', uri); } catch { /* quota */ }
    } else {
      localStorage.removeItem('speakfree_profile_image');
    }
  }, []);

  const addFriend = useCallback((codeOrName: string) => {
    const clean = codeOrName.trim();
    if (!clean) return;
    const upper = clean.toUpperCase();
    const existing = friends.find(f => f.friendCode.toUpperCase() === upper || f.name.toUpperCase() === upper);
    if (existing) {
      setBillingMessage(`${existing.name} is already in your friends list.`);
      return;
    }
    const newFriend: Friend = {
      id: crypto.randomUUID(),
      friendCode: upper.startsWith('SPK-') ? upper : `SPK-${Math.floor(1000 + Math.random() * 9000)}`,
      name: upper.startsWith('SPK-') ? `Learner #${upper.replace('SPK-', '')}` : clean,
      isOnline: true,
      avatarColorIndex: Math.floor(Math.random() * 5),
      lastMessage: 'Added to friends. Tap to chat or call.',
      lastMessageTime: 'Just now',
      level: 'Intermediate',
      streak: 1,
      location: 'India',
    };
    setFriends(prev => [newFriend, ...prev]);
    addLog(`Friend added: ${newFriend.name}`, 'info');
  }, [friends, addLog]);

  const openChatWithFriend = useCallback((friend: Friend) => {
    activeChatFriendIdRef.current = friend.id;
    setActiveChatFriend(friend);
    setActiveChatMessages(chatStoreRef.current[friend.id] ?? []);
  }, []);

  const closeChat = useCallback(() => {
    if (replyTimeoutRef.current) {
      clearTimeout(replyTimeoutRef.current);
      replyTimeoutRef.current = null;
    }
    activeChatFriendIdRef.current = null;
    setActiveChatFriend(null);
    setActiveChatMessages([]);
  }, []);

  const sendChatMessage = useCallback((text: string) => {
    const friend = activeChatFriend;
    if (!friend || !text.trim()) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      senderId: user.userId,
      senderName: user.displayName,
      text: text.trim(),
      timeFormatted: timeStr,
    };
    const list = chatStoreRef.current[friend.id] ?? [];
    chatStoreRef.current[friend.id] = [...list, msg];
    setActiveChatMessages(prev => [...prev, msg]);
    setFriends(prev => prev.map(f => f.id === friend.id ? { ...f, lastMessage: text.trim(), lastMessageTime: timeStr } : f));

    if (replyTimeoutRef.current) clearTimeout(replyTimeoutRef.current);
    const friendId = friend.id;
    replyTimeoutRef.current = setTimeout(() => {
      const reply: ChatMessage = {
        id: crypto.randomUUID(),
        senderId: friendId,
        senderName: friend.name,
        text: 'That sounds great! Would you like to do a quick voice call now?',
        timeFormatted: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      };
      chatStoreRef.current[friendId] = [...(chatStoreRef.current[friendId] ?? []), reply];
      if (activeChatFriendIdRef.current === friendId) {
        setActiveChatMessages(prev => [...prev, reply]);
      }
    }, 1200);
  }, [activeChatFriend, user.userId, user.displayName]);

  const launchGooglePlayPurchase = useCallback(() => {
    if (user.isGuest) {
      setShowAuthDialog(true);
      return;
    }
    setIsBillingProcessing(true);
    setBillingMessage(null);
    addLog('Launching purchase flow', 'info');

    setTimeout(() => {
      const generatedOrderId = `GPA.${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + 5);
      const formattedExpiry = expiry.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

      setUser(prev => ({
        ...prev,
        isSubscribed: true,
        subscriptionExpiryDate: formattedExpiry,
        googlePlayOrderId: generatedOrderId,
      }));
      setIsBillingProcessing(false);
      addLog('VIP plan activated', 'info');
    }, 1200);
  }, [user.isGuest, addLog]);

  const clearBillingMessage = useCallback(() => setBillingMessage(null), []);
  const clearLogs = useCallback(() => setLogs([]), []);

  const selectTab = useCallback((tab: AppTab) => {
    setCurrentTab(tab);
    if (callState === 'ENDED' || callState === 'ERROR') {
      setCallState('IDLE');
      setIsFreeLimitReached(false);
      setStatusMessage('');
    }
  }, [callState]);

  useEffect(() => {
    return () => {
      clearTimers();
      if (replyTimeoutRef.current) clearTimeout(replyTimeoutRef.current);
    };
  }, [clearTimers]);

  return {
    user,
    friends,
    currentTab,
    showAuthDialog,
    activeChatFriend,
    activeChatMessages,
    callState,
    callDurationFormatted,
    callDurationSeconds,
    isFreeLimitReached,
    searchingSeconds,
    isMuted,
    isSpeakerOn,
    partnerLabel,
    statusMessage,
    isBillingProcessing,
    billingMessage,
    logs,
    selectTab,
    openAuthDialog: () => setShowAuthDialog(true),
    closeAuthDialog: () => setShowAuthDialog(false),
    loginWithEmail,
    logout,
    updateProfileImage,
    addFriend,
    openChatWithFriend,
    closeChat,
    sendChatMessage,
    findPartner,
    startDirectCallWithFriend,
    cancelSearch,
    endCall,
    toggleMute,
    toggleSpeaker,
    launchGooglePlayPurchase,
    clearBillingMessage,
    clearLogs,
    dismissCallEnded,
  };
}
