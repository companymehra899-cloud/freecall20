import { useState, useRef, useCallback, useEffect } from 'react';
import type { UserAccount, Friend, ChatMessage, CallState, AppTab } from './types';
import { AVATAR_GRADIENTS, MAX_FREE_CALL_SECONDS } from './types';

const INITIAL_FRIENDS: Friend[] = [
  {
    id: 'f_1',
    friendCode: 'SPK-4821',
    name: 'Aarav Sharma (Advanced)',
    isOnline: true,
    avatarColorIndex: 1,
    lastMessage: "Hey! Let's practice IELTS speaking topics today?",
    lastMessageTime: '12:30 PM',
  },
  {
    id: 'f_2',
    friendCode: 'SPK-8923',
    name: 'Priya Patel (Intermediate)',
    isOnline: true,
    avatarColorIndex: 2,
    lastMessage: 'Thanks for the great conversation earlier!',
    lastMessageTime: 'Yesterday',
  },
  {
    id: 'f_3',
    friendCode: 'SPK-3109',
    name: 'Rohan Verma (Beginner)',
    isOnline: false,
    avatarColorIndex: 3,
    lastMessage: 'Will be online at 8 PM for mock interview.',
    lastMessageTime: '2 days ago',
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
    f_1: [
      { id: 'm1', senderId: 'f_1', senderName: 'Aarav Sharma', text: 'Hi there! Are you free for a 10-minute speaking drill?', timeFormatted: '11:45 AM' },
      { id: 'm2', senderId: userId, senderName: 'Me', text: "Yes, sure! Let's discuss business idioms and accent clarity.", timeFormatted: '12:15 PM' },
      { id: 'm3', senderId: 'f_1', senderName: 'Aarav Sharma', text: "Hey! Let's practice IELTS speaking topics today?", timeFormatted: '12:30 PM' },
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
  // actions
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
    { time: '09:14:02.120', action: 'App initialized with Zero-Cost Firestore P2P Signaling', type: 'info' },
  ]);

  const chatStoreRef = useRef<Record<string, ChatMessage[]>>({});
  const searchTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const callTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const connectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const replyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Seed chats once on mount
  useEffect(() => {
    chatStoreRef.current = seedChats(user.userId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addLog = useCallback((action: string, type: 'write' | 'read' | 'delete' | 'info') => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
    setLogs(prev => [{ time: timeStr, action, type }, ...prev.slice(0, 19)]);
  }, []);

  const startCallTimer = useCallback((isSubscribed: boolean) => {
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    let seconds = 0;
    setCallDurationSeconds(0);
    setCallDurationFormatted('00:00');
    setIsFreeLimitReached(false);

    callTimerRef.current = setInterval(() => {
      seconds++;
      setCallDurationSeconds(seconds);
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      setCallDurationFormatted(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);

      if (!isSubscribed && seconds >= MAX_FREE_CALL_SECONDS) {
        if (callTimerRef.current) clearInterval(callTimerRef.current);
        callTimerRef.current = null;
        setIsFreeLimitReached(true);
        setCallState('ENDED');
        setStatusMessage('Free 20-Min Call Limit Reached');
        addLog('⏱️ Free 20-Min Call Limit Reached. Call automatically disconnected.', 'info');
        // Update call stats
        setUser(prev => ({
          ...prev,
          totalCallsMade: prev.totalCallsMade + 1,
          totalTalkTimeSeconds: prev.totalTalkTimeSeconds + seconds,
        }));
      }
    }, 1000) as unknown as ReturnType<typeof setInterval>;
  }, [addLog]);

  const resetAfterDelay = useCallback(() => {
    resetTimeoutRef.current = setTimeout(() => {
      setCallState('IDLE');
      setCallDurationFormatted('00:00');
      setCallDurationSeconds(0);
      setPartnerLabel('Anonymous Partner');
      setStatusMessage('');
    }, 2000);
  }, []);

  const findPartner = useCallback(() => {
    setCallState('SEARCHING');
    setSearchingSeconds(0);
    setIsMuted(false);
    setIsSpeakerOn(true);
    setIsFreeLimitReached(false);
    setPartnerLabel('Anonymous Partner');
    setStatusMessage('Matching you with an English learner...');
    addLog('Matchmaking request: generated local ephemeral ID', 'info');
    addLog('CREATE /waiting_room/anon_user {status: "searching"}', 'write');

    let count = 0;
    searchTimerRef.current = setInterval(() => {
      count++;
      setSearchingSeconds(count);

      if (count === 3) {
        if (searchTimerRef.current) clearInterval(searchTimerRef.current);
        searchTimerRef.current = null;
        setCallState('CONNECTING');
        const partners = ['Rahul Verma (Delhi)', 'Simran Kaur (Chandigarh)', 'Amit Deshmukh (Pune)', 'Kavya Nair (Kerala)'];
        const chosen = partners[Math.floor(Math.random() * partners.length)];
        const randId = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase();
        setPartnerLabel(`Learner #${randId}`);
        addLog(`MATCH FOUND with learner: ${chosen} (#${randId})`, 'info');
        addLog('CREATE /rooms/room_9941 {callerId, calleeId, offer}', 'write');

        connectTimeoutRef.current = setTimeout(() => {
          setCallState('IN_CALL');
          addLog('STUN Binding Success -> WebRTC Audio: CONNECTED', 'info');
          addLog('⚡ PURGE /waiting_room/anon_user (0 Firestore Storage)', 'delete');
          addLog('⚡ PURGE /rooms/room_9941 (Signaling Docs Cleaned)', 'delete');
          addLog('🔒 Firestore snapshot listeners detached (0 active reads)', 'info');
          startCallTimer(user.isSubscribed);
        }, 1200);
      }
    }, 1000) as unknown as ReturnType<typeof setInterval>;
  }, [addLog, startCallTimer, user.isSubscribed]);

  const startDirectCallWithFriend = useCallback((friend: Friend) => {
    setPartnerLabel(friend.name);
    setCallState('CONNECTING');
    setIsMuted(false);
    setIsSpeakerOn(true);
    setIsFreeLimitReached(false);
    setStatusMessage('Connecting to live call...');
    addLog(`Direct Call ringing peer: ${friend.name}`, 'write');

    connectTimeoutRef.current = setTimeout(() => {
      setCallState('IN_CALL');
      addLog(`P2P Audio Connected with friend ${friend.name}`, 'info');
      startCallTimer(user.isSubscribed);
    }, 1500);
  }, [addLog, startCallTimer, user.isSubscribed]);

  const cancelSearch = useCallback(() => {
    if (searchTimerRef.current) clearInterval(searchTimerRef.current);
    searchTimerRef.current = null;
    addLog('DELETE /waiting_room/anon_user (search cancelled)', 'delete');
    setCallState('IDLE');
    setSearchingSeconds(0);
    setPartnerLabel('Anonymous Partner');
    setStatusMessage('');
  }, [addLog]);

  const endCall = useCallback(() => {
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    callTimerRef.current = null;
    const talkSeconds = callDurationSeconds;
    addLog('PeerConnection closed. Audio hardware released.', 'info');
    if (talkSeconds > 0) {
      setUser(prev => ({
        ...prev,
        totalCallsMade: prev.totalCallsMade + 1,
        totalTalkTimeSeconds: prev.totalTalkTimeSeconds + talkSeconds,
      }));
    }
    setStatusMessage('Call Ended');
    setCallState('ENDED');
    resetAfterDelay();
  }, [addLog, callDurationSeconds, resetAfterDelay]);

  const toggleMute = useCallback(() => setIsMuted(prev => !prev), []);
  const toggleSpeaker = useCallback(() => setIsSpeakerOn(prev => !prev), []);

  const loginWithEmail = useCallback((name: string, email: string) => {
    const cleanEmail = email.trim();
    setUser(prev => ({
      ...prev,
      userId: cleanEmail,
      displayName: name.trim() || 'English Learner',
      email: cleanEmail,
      isGuest: false,
    }));
    setShowAuthDialog(false);
    addLog(`Firebase Auth: signInWithEmailAndPassword() successful for ${cleanEmail}`, 'read');
    addLog(`Firestore: Initialized secure profile under /Users/${cleanEmail}`, 'write');
  }, [addLog]);

  const logout = useCallback(() => {
    setUser(createGuestUser());
    addLog('User logged out. Switched to Guest mode.', 'info');
  }, [addLog]);

  const updateProfileImage = useCallback((uri: string | null) => {
    setUser(prev => {
      const updated = { ...prev, profileImageUri: uri };
      return updated;
    });
    if (uri) {
      try { localStorage.setItem('speakfree_profile_image', uri); } catch { /* quota */ }
    } else {
      localStorage.removeItem('speakfree_profile_image');
    }
  }, []);

  const addFriend = useCallback((codeOrName: string) => {
    const clean = codeOrName.trim().toUpperCase();
    if (!clean) return;
    const existing = friends.find(f => f.friendCode.toUpperCase() === clean || f.name.toUpperCase() === clean);
    if (existing) {
      setBillingMessage(`${existing.name} is already in your Friend list!`);
      return;
    }
    const newFriend: Friend = {
      id: crypto.randomUUID(),
      friendCode: clean.startsWith('SPK-') ? clean : `SPK-${Math.floor(1000 + Math.random() * 9000)}`,
      name: clean.startsWith('SPK-') ? `Learner #${clean.replace('SPK-', '')}` : codeOrName.trim(),
      isOnline: true,
      avatarColorIndex: Math.floor(Math.random() * 5),
      lastMessage: 'Added to Friends! Tap to start direct call or chat.',
      lastMessageTime: 'Just now',
    };
    setFriends(prev => [newFriend, ...prev]);
    addLog(`Friend added: ${newFriend.name}`, 'info');
  }, [friends, addLog]);

  const openChatWithFriend = useCallback((friend: Friend) => {
    setActiveChatFriend(friend);
    setActiveChatMessages(chatStoreRef.current[friend.id] ?? []);
  }, []);

  const closeChat = useCallback(() => {
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

    // Update friend last message
    setFriends(prev => prev.map(f => f.id === friend.id ? { ...f, lastMessage: text.trim(), lastMessageTime: timeStr } : f));

    // Simulated reply
    replyTimeoutRef.current = setTimeout(() => {
      const reply: ChatMessage = {
        id: crypto.randomUUID(),
        senderId: friend.id,
        senderName: friend.name,
        text: "That sounds great! Would you like to do a quick voice call now?",
        timeFormatted: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      };
      chatStoreRef.current[friend.id] = [...chatStoreRef.current[friend.id], reply];
      setActiveChatMessages(prev => [...prev, reply]);
    }, 1200);
  }, [activeChatFriend, user.userId, user.displayName]);

  const launchGooglePlayPurchase = useCallback(() => {
    if (user.isGuest) {
      setShowAuthDialog(true);
      return;
    }
    setIsBillingProcessing(true);
    setBillingMessage(null);
    addLog('Google Play Billing v7: BillingClient.launchBillingFlow(speakfree_vip_5months)', 'info');

    setTimeout(() => {
      const generatedOrderId = `GPA.${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10000 + Math.random() * 90000)}`;
      const token = `pbtok_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;
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
      setStatusMessage('Google Play Purchase Verified! VIP Plan Activated.');
      addLog(`Google Play: Purchase state PURCHASED (${generatedOrderId})`, 'info');
      addLog(`BillingClient: acknowledgePurchase() verified token ${token.substring(0, 16)}...`, 'write');
      addLog(`Firestore: Synced verified Google Play receipt under /Users/${user.email || 'learner'}`, 'write');
    }, 1200);
  }, [user.isGuest, user.email, addLog]);

  const clearBillingMessage = useCallback(() => setBillingMessage(null), []);
  const clearLogs = useCallback(() => setLogs([]), []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimerRef.current) clearInterval(searchTimerRef.current);
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      if (connectTimeoutRef.current) clearTimeout(connectTimeoutRef.current);
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
      if (replyTimeoutRef.current) clearTimeout(replyTimeoutRef.current);
    };
  }, []);

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
    selectTab: setCurrentTab,
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
  };
}
