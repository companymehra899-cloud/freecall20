import { useAppStore } from '../useAppStore';
import AppTopBar from '../components/AppTopBar';
import AppBottomBar from '../components/AppBottomBar';
import HomeScreen from './HomeScreen';
import FriendsScreen from './FriendsScreen';
import SubscriptionScreen from './SubscriptionScreen';
import ProfileScreen from './ProfileScreen';
import DirectChatScreen from './DirectChatScreen';
import AuthDialog from './AuthDialog';
import SearchingScreen from './SearchingScreen';
import CallingScreen from './CallingScreen';
import CallEndedScreen from './CallEndedScreen';

interface Props {
  store: ReturnType<typeof useAppStore>;
}

export default function PhoneMockup({ store }: Props) {
  const {
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
    selectTab,
    openAuthDialog,
    closeAuthDialog,
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
  } = store;

  return (
    <div className="w-full max-w-[420px] h-[780px] bg-[#090B0E] rounded-[48px] border-[7px] border-slate-800 shadow-2xl shadow-emerald-950/25 overflow-hidden relative flex flex-col select-none ring-1 ring-white/10">
      {/* Phone notch bar */}
      <div className="h-8 w-full flex items-center justify-between px-7 pt-2.5 z-30 bg-[#090B0E] shrink-0">
        <span className="text-xs font-bold text-slate-200">9:41</span>
        <div className="w-20 h-4 bg-black rounded-full" />
        <div className="flex items-center gap-1.5 text-xs text-slate-200">
          <span className="text-emerald-400 font-bold text-[11px]">5G</span>
          <div className="w-4 h-2.5 border border-slate-400 rounded-xs flex items-center p-0.5">
            <div className="w-full h-full bg-emerald-400" />
          </div>
        </div>
      </div>

      {/* Main phone container */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-[#090B0E]">
        {/* Call state overlays take over the screen */}
        {callState !== 'IDLE' ? (
          <>
            {(callState === 'SEARCHING' || callState === 'CONNECTING') && (
              <SearchingScreen
                callState={callState}
                searchingSeconds={searchingSeconds}
                statusMessage={statusMessage}
                onCancelClicked={cancelSearch}
              />
            )}
            {callState === 'IN_CALL' && (
              <CallingScreen
                partnerLabel={partnerLabel}
                durationFormatted={callDurationFormatted}
                durationSeconds={callDurationSeconds}
                isSubscribed={user.isSubscribed}
                isMuted={isMuted}
                isSpeakerOn={isSpeakerOn}
                onToggleMute={toggleMute}
                onToggleSpeaker={toggleSpeaker}
                onEndCall={endCall}
              />
            )}
            {(callState === 'ENDED' || callState === 'ERROR') && (
              <CallEndedScreen
                isLimitReached={isFreeLimitReached}
                statusMessage={callState === 'ERROR' ? statusMessage : isFreeLimitReached ? 'Free 20-Min Call Limit Reached' : 'Call Completed'}
                onStartNextCall={findPartner}
                onOpenSubscription={() => selectTab('SUBSCRIPTION')}
              />
            )}
          </>
        ) : (
          <>
            {/* Top bar */}
            <AppTopBar user={user} onNavigateTab={selectTab} />

            {/* Screen content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {currentTab === 'HOME' && (
                <HomeScreen user={user} onFindPartnerClicked={findPartner} />
              )}
              {currentTab === 'FRIENDS' && (
                <FriendsScreen
                  user={user}
                  friends={friends}
                  onAddFriend={addFriend}
                  onDirectCallFriend={startDirectCallWithFriend}
                  onOpenChat={openChatWithFriend}
                  onOpenSubscription={() => selectTab('SUBSCRIPTION')}
                  onOpenAuth={openAuthDialog}
                />
              )}
              {currentTab === 'SUBSCRIPTION' && (
                <SubscriptionScreen
                  user={user}
                  isBillingProcessing={isBillingProcessing}
                  billingMessage={billingMessage}
                  onSubscribeGooglePlay={launchGooglePlayPurchase}
                  onOpenAuth={openAuthDialog}
                  onDismissBillingMessage={clearBillingMessage}
                />
              )}
              {currentTab === 'PROFILE' && (
                <ProfileScreen
                  user={user}
                  onOpenAuth={openAuthDialog}
                  onLogout={logout}
                  onNavigateTab={selectTab}
                  onUpdateProfileImage={updateProfileImage}
                />
              )}
            </div>

            {/* Bottom bar */}
            <AppBottomBar
              currentTab={currentTab}
              onTabSelected={selectTab}
              hasSubscribed={user.isSubscribed}
            />
          </>
        )}

        {/* Direct chat overlay */}
        {activeChatFriend && (
          <DirectChatScreen
            user={user}
            friend={activeChatFriend}
            messages={activeChatMessages}
            onSendMessage={sendChatMessage}
            onDirectCall={() => {
              const friend = activeChatFriend;
              closeChat();
              startDirectCallWithFriend(friend);
            }}
            onBack={closeChat}
            onOpenSubscription={() => {
              closeChat();
              selectTab('SUBSCRIPTION');
            }}
          />
        )}

        {/* Auth dialog */}
        {showAuthDialog && (
          <AuthDialog
            onDismiss={closeAuthDialog}
            onSubmitAuth={loginWithEmail}
          />
        )}

        {/* Phone bottom pill */}
        <div className="w-24 h-1 bg-slate-800 rounded-full mx-auto my-1.5 shrink-0 z-30" />
      </div>
    </div>
  );
}
