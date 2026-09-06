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
    dismissCallEnded,
  } = store;

  const inCallFlow = callState !== 'IDLE';

  return (
    <div className="h-dvh w-full max-w-[480px] mx-auto bg-[#090B0E] flex flex-col overflow-hidden relative">
      {inCallFlow ? (
        <div className="flex-1 min-h-0 flex flex-col">
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
              statusMessage={
                callState === 'ERROR'
                  ? statusMessage
                  : isFreeLimitReached
                    ? 'Free 10-min call limit reached'
                    : 'Call completed'
              }
              onStartNextCall={findPartner}
              onOpenSubscription={() => {
                dismissCallEnded();
                selectTab('SUBSCRIPTION');
              }}
              onDone={dismissCallEnded}
            />
          )}
        </div>
      ) : (
        <>
          <AppTopBar user={user} onNavigateTab={selectTab} />
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
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
                billingMessage={billingMessage}
                onDismissBillingMessage={clearBillingMessage}
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
          <AppBottomBar currentTab={currentTab} onTabSelected={selectTab} />
        </>
      )}

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

      {showAuthDialog && (
        <AuthDialog onDismiss={closeAuthDialog} onSubmitAuth={loginWithEmail} />
      )}
    </div>
  );
}
