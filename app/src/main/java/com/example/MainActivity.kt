package com.example

import android.Manifest
import android.app.Activity
import android.content.pm.PackageManager
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.VolumeDown
import androidx.compose.material.icons.automirrored.filled.VolumeUp
import androidx.compose.material.icons.filled.CallEnd
import androidx.compose.material.icons.filled.Diamond
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.MicOff
import androidx.compose.material.icons.outlined.GraphicEq
import androidx.compose.material.icons.outlined.RecordVoiceOver
import androidx.compose.material3.Icon
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import com.example.model.AppTab
import com.example.model.CallState
import com.example.ui.components.AppBottomBar
import com.example.ui.components.AppTopBar
import com.example.ui.screens.AuthDialog
import com.example.ui.screens.DirectChatScreen
import com.example.ui.screens.FriendsScreen
import com.example.ui.screens.HomeScreen
import com.example.ui.screens.ProfileScreen
import com.example.ui.screens.SubscriptionScreen
import com.example.ui.theme.DarkBg
import com.example.ui.theme.DarkBorder
import com.example.ui.theme.DarkSurface
import com.example.ui.theme.DarkSurfaceElevated
import com.example.ui.theme.EmeraldAccent
import com.example.ui.theme.EmeraldLight
import com.example.ui.theme.GoldAccent
import com.example.ui.theme.GoldBorder
import com.example.ui.theme.GoldLight
import com.example.ui.theme.GoldSurface
import com.example.ui.theme.MyApplicationTheme
import com.example.ui.theme.RedEndCall
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary
import com.example.viewmodel.MainViewModel

class MainActivity : ComponentActivity() {

    private val viewModel: MainViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            MyApplicationTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = DarkBg
                ) {
                    SpeakFreeApp(viewModel)
                }
            }
        }
    }
}

@Composable
fun SpeakFreeApp(viewModel: MainViewModel) {
    val context = LocalContext.current
    var hasAudioPermission by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.RECORD_AUDIO
            ) == PackageManager.PERMISSION_GRANTED
        )
    }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        hasAudioPermission = isGranted
        if (isGranted) {
            viewModel.onMicPermissionGranted()
        }
    }

    val user by viewModel.currentUser.collectAsState()
    val friends by viewModel.friends.collectAsState()
    val currentTab by viewModel.currentTab.collectAsState()
    val showAuthDialog by viewModel.showAuthDialog.collectAsState()
    val activeChatFriend by viewModel.activeChatFriend.collectAsState()
    val activeChatMessages by viewModel.activeChatMessages.collectAsState()

    val callState by viewModel.callState.collectAsState()
    val callDuration by viewModel.callDurationFormatted.collectAsState()
    val callDurationSeconds by viewModel.callDurationSeconds.collectAsState()
    val isFreeLimitReached by viewModel.isFreeLimitReached.collectAsState()
    val searchingSecs by viewModel.searchingSeconds.collectAsState()
    val isMuted by viewModel.isMuted.collectAsState()
    val isSpeakerOn by viewModel.isSpeakerOn.collectAsState()
    val partnerLabel by viewModel.partnerLabel.collectAsState()
    val statusMessage by viewModel.statusMessage.collectAsState()
    val isBillingProcessing by viewModel.isBillingProcessing.collectAsState()
    val billingMessage by viewModel.billingMessage.collectAsState()

    if (activeChatFriend != null && callState == CallState.IDLE) {
        DirectChatScreen(
            user = user,
            friend = activeChatFriend!!,
            messages = activeChatMessages,
            onSendMessage = { viewModel.sendChatMessage(it) },
            onDirectCall = {
                val friend = activeChatFriend!!
                if (hasAudioPermission) {
                    viewModel.startDirectCallWithFriend(friend)
                } else {
                    viewModel.prepareMicPermission(friend)
                    permissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
                }
            },
            onBack = { viewModel.closeChat() },
            onOpenSubscription = {
                viewModel.closeChat()
                viewModel.selectTab(AppTab.SUBSCRIPTION)
            }
        )
        return
    }

    AnimatedContent(
        targetState = callState,
        transitionSpec = { fadeIn(tween(300)) togetherWith fadeOut(tween(300)) },
        label = "CallStateTransition"
    ) { state ->
        when (state) {
            CallState.IDLE -> {
                Scaffold(
                    topBar = {
                        AppTopBar(
                            user = user,
                            onAuthClicked = { viewModel.openAuthDialog() },
                            onSubscriptionClicked = { viewModel.selectTab(AppTab.SUBSCRIPTION) },
                            onNavigateTab = { viewModel.selectTab(it) }
                        )
                    },
                    bottomBar = {
                        AppBottomBar(
                            currentTab = currentTab,
                            onTabSelected = { viewModel.selectTab(it) },
                            hasSubscribed = user.isSubscribed
                        )
                    },
                    containerColor = DarkBg
                ) { innerPadding ->
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(innerPadding)
                    ) {
                        when (currentTab) {
                            AppTab.HOME -> {
                                HomeScreen(
                                    user = user,
                                    onFindPartnerClicked = {
                                        if (hasAudioPermission) {
                                            viewModel.findPartner()
                                        } else {
                                            viewModel.prepareMicPermission(null)
                                            permissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
                                        }
                                    },
                                    onNavigateTab = { viewModel.selectTab(it) },
                                    onOpenAuth = { viewModel.openAuthDialog() }
                                )
                            }

                            AppTab.FRIENDS -> {
                                FriendsScreen(
                                    user = user,
                                    friends = friends,
                                    onAddFriend = { viewModel.addFriend(it) },
                                    onDirectCallFriend = { friend ->
                                        if (hasAudioPermission) {
                                            viewModel.startDirectCallWithFriend(friend)
                                        } else {
                                            viewModel.prepareMicPermission(friend)
                                            permissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
                                        }
                                    },
                                    onOpenChat = { friend ->
                                        viewModel.openChatWithFriend(friend)
                                    },
                                    onOpenSubscription = { viewModel.selectTab(AppTab.SUBSCRIPTION) },
                                    onOpenAuth = { viewModel.openAuthDialog() }
                                )
                            }

                            AppTab.SUBSCRIPTION -> {
                                SubscriptionScreen(
                                    user = user,
                                    isBillingProcessing = isBillingProcessing,
                                    billingMessage = billingMessage,
                                    onSubscribeGooglePlay = {
                                        (context as? Activity)?.let { act ->
                                            viewModel.launchGooglePlayPurchase(act)
                                        }
                                    },
                                    onOpenAuth = { viewModel.openAuthDialog() },
                                    onDismissBillingMessage = { viewModel.clearBillingMessage() }
                                )
                            }

                            AppTab.PROFILE -> {
                                ProfileScreen(
                                    user = user,
                                    onOpenAuth = { viewModel.openAuthDialog() },
                                    onLogout = { viewModel.logout() },
                                    onNavigateTab = { viewModel.selectTab(it) },
                                    onUpdateProfileImage = { viewModel.updateProfileImage(it) }
                                )
                            }
                        }
                    }
                }

                // Auth Dialog Modal
                if (showAuthDialog) {
                    AuthDialog(
                        onDismiss = { viewModel.closeAuthDialog() },
                        onSubmitAuth = { name, email, uid ->
                            viewModel.loginWithEmail(name, email, uid)
                        }
                    )
                }
            }

            CallState.SEARCHING, CallState.CONNECTING -> {
                SearchingScreen(
                    callState = state,
                    searchingSeconds = searchingSecs,
                    statusMessage = statusMessage,
                    onCancelClicked = { viewModel.cancelSearch() }
                )
            }

            CallState.IN_CALL -> {
                CallingScreen(
                    partnerLabel = partnerLabel,
                    durationFormatted = callDuration,
                    durationSeconds = callDurationSeconds,
                    isSubscribed = user.isSubscribed,
                    isMuted = isMuted,
                    isSpeakerOn = isSpeakerOn,
                    onToggleMute = { viewModel.toggleMute() },
                    onToggleSpeaker = { viewModel.toggleSpeaker() },
                    onEndCall = { viewModel.endCall() }
                )
            }

            CallState.ENDED, CallState.ERROR -> {
                CallEndedScreen(
                    isLimitReached = isFreeLimitReached,
                    statusMessage = when {
                        state == CallState.ERROR -> statusMessage.ifBlank { "Call failed" }
                        isFreeLimitReached -> "Free 10-min call limit reached"
                        else -> statusMessage.ifBlank { "Call completed" }
                    },
                    onStartNextCall = {
                        if (hasAudioPermission) {
                            viewModel.findPartner()
                        } else {
                            viewModel.prepareMicPermission(null)
                            permissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
                        }
                    },
                    onOpenSubscription = {
                        viewModel.dismissCallEnded()
                        viewModel.selectTab(AppTab.SUBSCRIPTION)
                    },
                    onDone = { viewModel.dismissCallEnded() }
                )
            }
        }
    }
}

/**
 * Animated Searching Screen with Expanding Radar Rings & Cancel Button.
 */
@Composable
fun SearchingScreen(
    callState: CallState,
    searchingSeconds: Int,
    statusMessage: String,
    onCancelClicked: () -> Unit
) {
    val infiniteTransition = rememberInfiniteTransition(label = "RadarTransition")
    val wave1 by infiniteTransition.animateFloat(
        initialValue = 0.5f,
        targetValue = 1.3f,
        animationSpec = infiniteRepeatable(
            animation = tween(2200, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "Wave1"
    )
    val alpha1 by infiniteTransition.animateFloat(
        initialValue = 0.6f,
        targetValue = 0f,
        animationSpec = infiniteRepeatable(
            animation = tween(2200, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "Alpha1"
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .statusBarsPadding()
            .navigationBarsPadding()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        // Status Top Badge
        Box(
            modifier = Modifier
                .padding(top = 24.dp)
                .clip(RoundedCornerShape(16.dp))
                .background(DarkSurface)
                .border(1.dp, DarkBorder, RoundedCornerShape(16.dp))
                .padding(horizontal = 14.dp, vertical = 6.dp)
        ) {
            Text(
                text = if (callState == CallState.CONNECTING) "Connecting to live call..." else "Looking for available speaker",
                color = TextSecondary,
                fontSize = 12.sp
            )
        }

        // Animated Radar Center
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier.size(280.dp)
        ) {
            // Expanding Ripple Wave
            Box(
                modifier = Modifier
                    .size(200.dp)
                    .scale(wave1)
                    .clip(CircleShape)
                    .border(2.dp, EmeraldAccent.copy(alpha = alpha1), CircleShape)
            )

            // Inner Core
            Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier
                    .size(110.dp)
                    .clip(CircleShape)
                    .background(DarkSurfaceElevated)
                    .border(1.5.dp, EmeraldAccent, CircleShape)
            ) {
                Icon(
                    imageVector = Icons.Outlined.GraphicEq,
                    contentDescription = "Searching",
                    tint = EmeraldLight,
                    modifier = Modifier.size(44.dp)
                )
            }
        }

        // Searching text and Cancel Action
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(
                text = if (callState == CallState.CONNECTING) "Connecting..." else "Searching for Partner...",
                color = TextPrimary,
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold
            )

            Text(
                text = "${searchingSeconds}s elapsed",
                color = TextSecondary,
                fontSize = 14.sp,
                modifier = Modifier.padding(top = 4.dp, bottom = 24.dp)
            )

            // Cancel Button
            Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .background(DarkSurfaceElevated)
                    .border(1.dp, DarkBorder, RoundedCornerShape(14.dp))
                    .clickable { onCancelClicked() }
                    .padding(vertical = 16.dp)
            ) {
                Text(
                    text = "Cancel Search",
                    color = TextSecondary,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Medium
                )
            }
        }
    }
}

/**
 * Active Calling Screen with live timer, audio waveforms, mute toggle, and End Call button.
 */
@Composable
fun CallingScreen(
    partnerLabel: String,
    durationFormatted: String,
    durationSeconds: Long,
    isSubscribed: Boolean,
    isMuted: Boolean,
    isSpeakerOn: Boolean,
    onToggleMute: () -> Unit,
    onToggleSpeaker: () -> Unit,
    onEndCall: () -> Unit
) {
    val infiniteTransition = rememberInfiniteTransition(label = "AudioWave")
    val waveHeight1 by infiniteTransition.animateFloat(
        initialValue = 8f,
        targetValue = 28f,
        animationSpec = infiniteRepeatable(
            animation = tween(400, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "Wave1"
    )
    val waveHeight2 by infiniteTransition.animateFloat(
        initialValue = 20f,
        targetValue = 44f,
        animationSpec = infiniteRepeatable(
            animation = tween(550, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "Wave2"
    )
    val waveHeight3 by infiniteTransition.animateFloat(
        initialValue = 12f,
        targetValue = 34f,
        animationSpec = infiniteRepeatable(
            animation = tween(480, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "Wave3"
    )

    val remainingSeconds = (600L - durationSeconds).coerceAtLeast(0L)
    val remMins = remainingSeconds / 60
    val remSecs = remainingSeconds % 60

    Column(
        modifier = Modifier
            .fillMaxSize()
            .statusBarsPadding()
            .padding(horizontal = 24.dp)
            .padding(top = 16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        // Top Live Call Timer & Connection Badge
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.padding(top = 8.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                modifier = Modifier
                    .clip(RoundedCornerShape(20.dp))
                    .background(DarkSurfaceElevated)
                    .border(1.dp, DarkBorder, RoundedCornerShape(20.dp))
                    .padding(horizontal = 14.dp, vertical = 6.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .clip(CircleShape)
                        .background(EmeraldAccent)
                )
                Text(
                    text = "Live Call",
                    color = EmeraldLight,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Free Call / VIP Plan Duration Status Pill (Small Timer)
            if (!isSubscribed) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(
                            if (remainingSeconds <= 120L) Color(0xFF3B1B1A) else DarkSurfaceElevated
                        )
                        .border(
                            1.dp,
                            if (remainingSeconds <= 120L) Color(0xFFEF4444) else DarkBorder,
                            RoundedCornerShape(12.dp)
                        )
                        .padding(horizontal = 12.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = if (remainingSeconds <= 120L) {
                            "⚠️ Free Limit: ${String.format(java.util.Locale.US, "%02d:%02d", remMins, remSecs)} left"
                        } else {
                            "⏱️ Free: ${String.format(java.util.Locale.US, "%02d:%02d", remMins, remSecs)} left"
                        },
                        color = if (remainingSeconds <= 120L) Color(0xFFFCA5A5) else EmeraldLight,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            } else {
                Box(
                    modifier = Modifier
                        .padding(top = 8.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(GoldSurface)
                        .border(1.dp, GoldBorder, RoundedCornerShape(12.dp))
                        .padding(horizontal = 12.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = "👑 VIP PRO: Unlimited Duration",
                        color = GoldLight,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        // Center Partner Visual & Animated Waveform
        Column(
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier
                    .size(110.dp)
                    .clip(CircleShape)
                    .background(DarkSurface)
                    .border(2.dp, DarkBorder, CircleShape)
            ) {
                Icon(
                    imageVector = Icons.Outlined.RecordVoiceOver,
                    contentDescription = "Partner Avatar",
                    tint = TextSecondary,
                    modifier = Modifier.size(48.dp)
                )
            }

            Spacer(modifier = Modifier.height(14.dp))

            Text(
                text = partnerLabel,
                color = TextPrimary,
                fontSize = 19.sp,
                fontWeight = FontWeight.SemiBold,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )

            Spacer(modifier = Modifier.height(20.dp))

            // Real-time voice animation bars
            Row(
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.height(44.dp)
            ) {
                VoiceBar(waveHeight1)
                VoiceBar(waveHeight2)
                VoiceBar(waveHeight3)
                VoiceBar(waveHeight2)
                VoiceBar(waveHeight1)
            }
        }

        // Bottom Controls: Mute, Speaker, End Call
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier
                .fillMaxWidth()
                .navigationBarsPadding()
                .padding(bottom = 24.dp)
        ) {
            Row(
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                // Speakerphone Toggle
                CallControlButton(
                    icon = if (isSpeakerOn) Icons.AutoMirrored.Filled.VolumeUp else Icons.AutoMirrored.Filled.VolumeDown,
                    isActive = isSpeakerOn,
                    label = if (isSpeakerOn) "Speaker" else "Earpiece",
                    onClick = onToggleSpeaker
                )

                // End Call Button (Prominent Red)
                Box(
                    contentAlignment = Alignment.Center,
                    modifier = Modifier
                        .size(68.dp)
                        .clip(CircleShape)
                        .background(RedEndCall)
                        .clickable { onEndCall() }
                ) {
                    Icon(
                        imageVector = Icons.Default.CallEnd,
                        contentDescription = "End Call",
                        tint = Color.White,
                        modifier = Modifier.size(30.dp)
                    )
                }

                // Microphone Mute Toggle
                CallControlButton(
                    icon = if (isMuted) Icons.Default.MicOff else Icons.Default.Mic,
                    isActive = !isMuted,
                    label = if (isMuted) "Unmute" else "Mute",
                    onClick = onToggleMute
                )
            }
        }
    }
}

@Composable
fun VoiceBar(heightDp: Float) {
    Box(
        modifier = Modifier
            .width(4.dp)
            .height(heightDp.dp)
            .clip(RoundedCornerShape(2.dp))
            .background(EmeraldAccent)
    )
}

@Composable
fun CallControlButton(
    icon: ImageVector,
    isActive: Boolean,
    label: String,
    onClick: () -> Unit
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier
                .size(54.dp)
                .clip(CircleShape)
                .background(if (isActive) DarkSurfaceElevated else DarkSurface)
                .border(1.dp, if (isActive) DarkBorder else Color.Transparent, CircleShape)
                .clickable { onClick() }
        ) {
            Icon(
                imageVector = icon,
                contentDescription = label,
                tint = if (isActive) TextPrimary else TextMuted,
                modifier = Modifier.size(24.dp)
            )
        }
        Spacer(modifier = Modifier.height(6.dp))
        Text(
            text = label,
            color = TextSecondary,
            fontSize = 11.sp
        )
    }
}

@Composable
fun CallEndedScreen(
    isLimitReached: Boolean = false,
    statusMessage: String,
    onStartNextCall: () -> Unit = {},
    onOpenSubscription: () -> Unit = {},
    onDone: () -> Unit = {}
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .statusBarsPadding()
            .navigationBarsPadding()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier
                .size(76.dp)
                .clip(CircleShape)
                .background(if (isLimitReached) GoldSurface else DarkSurfaceElevated)
                .border(1.dp, if (isLimitReached) GoldAccent else DarkBorder, CircleShape)
        ) {
            Icon(
                imageVector = if (isLimitReached) Icons.Default.Diamond else Icons.Default.CallEnd,
                contentDescription = "Ended",
                tint = if (isLimitReached) GoldLight else RedEndCall,
                modifier = Modifier.size(34.dp)
            )
        }

        Spacer(modifier = Modifier.height(18.dp))

        Text(
            text = statusMessage,
            color = TextPrimary,
            fontSize = 19.sp,
            fontWeight = FontWeight.Bold,
            textAlign = TextAlign.Center
        )

        if (isLimitReached) {
            Text(
                text = "Free users get 10 mins per person/call. Calling is 100% UNLIMITED — you can immediately start another call with any partner, or upgrade to 5-Month Pass for non-stop conversations!",
                color = TextSecondary,
                fontSize = 12.sp,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(top = 8.dp, bottom = 20.dp)
            )

            // Button to start next free call right away
            Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .background(EmeraldAccent)
                    .clickable { onStartNextCall() }
                    .padding(vertical = 14.dp)
            ) {
                Text(
                    text = "🎙️ Start Next Free Call",
                    color = Color.Black,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Button to upgrade to 5-month plan
            Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .background(DarkSurfaceElevated)
                    .border(1.dp, GoldAccent, RoundedCornerShape(14.dp))
                    .clickable { onOpenSubscription() }
                    .padding(vertical = 14.dp)
            ) {
                Text(
                    text = "Remove 10-min limit · ₹100 / 5 months",
                    color = GoldLight,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }
        } else {
            Text(
                text = "Ready for the next practice session.",
                color = TextMuted,
                fontSize = 13.sp,
                modifier = Modifier.padding(top = 6.dp, bottom = 20.dp)
            )
            Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .background(EmeraldAccent)
                    .clickable { onDone() }
                    .padding(vertical = 14.dp)
            ) {
                Text(
                    text = "Back to home",
                    color = Color.Black,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}
