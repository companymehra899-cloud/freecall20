// Data models matching the Android app (CallModels.kt & AccountRepository.kt)

export type CallState = 'IDLE' | 'SEARCHING' | 'CONNECTING' | 'IN_CALL' | 'ENDED' | 'ERROR';
export type AppTab = 'HOME' | 'FRIENDS' | 'SUBSCRIPTION' | 'PROFILE';
export type AuthStep = 'LOGIN' | 'SIGNUP';

export interface UserAccount {
  userId: string;
  displayName: string;
  phoneNumber: string;
  email: string;
  friendCode: string;
  isGuest: boolean;
  isSubscribed: boolean;
  subscriptionExpiryDate: string;
  googlePlayOrderId: string;
  streakDays: number;
  avatarColorIndex: number;
  profileImageUri: string | null;
  totalCallsMade: number;
  totalTalkTimeSeconds: number;
}

export interface Friend {
  id: string;
  friendCode: string;
  name: string;
  isOnline: boolean;
  avatarColorIndex: number;
  lastMessage: string;
  lastMessageTime: string;
  level: string;
  streak: number;
  location: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timeFormatted: string;
}

export const AVATAR_GRADIENTS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EC4899', // Pink
];

export const MAX_FREE_CALL_SECONDS = 600; // 10 minutes
