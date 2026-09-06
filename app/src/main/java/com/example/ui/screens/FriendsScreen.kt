package com.example.ui.screens

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
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Chat
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Diamond
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.PersonAdd
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.Friend
import com.example.model.UserAccount
import com.example.ui.theme.DarkBg
import com.example.ui.theme.DarkBorder
import com.example.ui.theme.DarkSurface
import com.example.ui.theme.DarkSurfaceElevated
import com.example.ui.theme.EmeraldAccent
import com.example.ui.theme.EmeraldLight
import com.example.ui.theme.GoldAccent
import com.example.ui.theme.GoldLight
import com.example.ui.theme.GoldSurface
import com.example.ui.theme.PurpleAccent
import com.example.ui.theme.PurpleLight
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary

@Composable
fun FriendsScreen(
    user: UserAccount,
    friends: List<Friend>,
    onAddFriend: (String) -> Unit,
    onDirectCallFriend: (Friend) -> Unit,
    onOpenChat: (Friend) -> Unit,
    onOpenSubscription: () -> Unit,
    onOpenAuth: () -> Unit
) {
    var searchInput by remember { mutableStateOf("") }
    val focusManager = LocalFocusManager.current

    val avatarGradients = listOf(
        Color(0xFF3B82F6), // Blue
        Color(0xFF10B981), // Emerald
        Color(0xFF8B5CF6), // Purple
        Color(0xFFF59E0B), // Amber
        Color(0xFFEC4899)  // Pink
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 20.dp, vertical = 8.dp)
    ) {
        // Top Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Speaking Friends",
                    color = TextPrimary,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Direct 1-on-1 Voice Calling & Chat",
                    color = TextMuted,
                    fontSize = 12.sp
                )
            }
            // My Friend Code Badge
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(12.dp))
                    .background(DarkSurfaceElevated)
                    .border(1.dp, DarkBorder, RoundedCornerShape(12.dp))
                    .padding(horizontal = 10.dp, vertical = 6.dp)
            ) {
                Column(horizontalAlignment = Alignment.End) {
                    Text(text = "My Code", color = TextMuted, fontSize = 9.sp)
                    Text(text = user.friendCode, color = EmeraldLight, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Guest Warning Banner (If not logged in)
        if (user.isGuest) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .background(DarkSurfaceElevated)
                    .border(1.dp, PurpleAccent.copy(alpha = 0.5f), RoundedCornerShape(14.dp))
                    .padding(14.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Login Required for Friends",
                            color = PurpleLight,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Log in to add friends, save contacts, and make direct calls.",
                            color = TextSecondary,
                            fontSize = 11.sp,
                            modifier = Modifier.padding(top = 2.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(10.dp))
                            .background(PurpleAccent)
                            .clickable { onOpenAuth() }
                            .padding(horizontal = 12.dp, vertical = 8.dp)
                    ) {
                        Text(
                            text = "Login",
                            color = Color.White,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
            Spacer(modifier = Modifier.height(14.dp))
        }

        // Add Friend Input Bar
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            OutlinedTextField(
                value = searchInput,
                onValueChange = { searchInput = it },
                placeholder = { Text("Enter Friend Code (e.g. SPK-4821)", color = TextMuted, fontSize = 12.sp) },
                singleLine = true,
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
                keyboardActions = KeyboardActions(onDone = {
                    if (searchInput.isNotBlank()) {
                        onAddFriend(searchInput)
                        searchInput = ""
                        focusManager.clearFocus()
                    }
                }),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = EmeraldAccent,
                    unfocusedBorderColor = DarkBorder,
                    focusedTextColor = TextPrimary,
                    unfocusedTextColor = TextPrimary,
                    focusedContainerColor = DarkSurface,
                    unfocusedContainerColor = DarkSurface
                ),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .weight(1f)
                    .height(52.dp)
            )

            Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier
                    .size(52.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(EmeraldAccent)
                    .clickable {
                        if (searchInput.isNotBlank()) {
                            onAddFriend(searchInput)
                            searchInput = ""
                            focusManager.clearFocus()
                        }
                    }
            ) {
                Icon(
                    imageVector = Icons.Default.PersonAdd,
                    contentDescription = "Add Friend",
                    tint = Color.Black,
                    modifier = Modifier.size(22.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // VIP Plan status / banner
        if (!user.isSubscribed) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(GoldSurface)
                    .border(1.dp, GoldAccent.copy(alpha = 0.5f), RoundedCornerShape(12.dp))
                    .clickable { onOpenSubscription() }
                    .padding(horizontal = 14.dp, vertical = 10.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Diamond,
                            contentDescription = "VIP",
                            tint = GoldLight,
                            modifier = Modifier.size(20.dp)
                        )
                        Column {
                            Text(
                                text = "Unlock Direct Calling & Text Chat",
                                color = GoldLight,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "₹100 for 5 Months unlimited plan",
                                color = TextSecondary,
                                fontSize = 11.sp
                            )
                        }
                    }
                    Text(
                        text = "Upgrade ➔",
                        color = GoldLight,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
            Spacer(modifier = Modifier.height(14.dp))
        }

        // Friends List
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            if (friends.isEmpty()) {
                item {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 40.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "No friends added yet",
                            color = TextSecondary,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                        Text(
                            text = "Share your code '${user.friendCode}' with someone or add them above!",
                            color = TextMuted,
                            fontSize = 12.sp,
                            modifier = Modifier.padding(top = 4.dp)
                        )
                    }
                }
            }

            items(friends) { friend ->
                FriendCard(
                    friend = friend,
                    avatarColor = avatarGradients[friend.avatarColorIndex % avatarGradients.size],
                    isSubscribed = user.isSubscribed,
                    isGuest = user.isGuest,
                    onDirectCall = {
                        if (user.isGuest) {
                            onOpenAuth()
                        } else if (!user.isSubscribed) {
                            onOpenSubscription()
                        } else {
                            onDirectCallFriend(friend)
                        }
                    },
                    onOpenChat = {
                        if (user.isGuest) {
                            onOpenAuth()
                        } else if (!user.isSubscribed) {
                            onOpenSubscription()
                        } else {
                            onOpenChat(friend)
                        }
                    }
                )
            }
        }
    }
}

@Composable
fun FriendCard(
    friend: Friend,
    avatarColor: Color,
    isSubscribed: Boolean,
    isGuest: Boolean,
    onDirectCall: () -> Unit,
    onOpenChat: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(DarkSurface)
            .border(1.dp, DarkBorder, RoundedCornerShape(16.dp))
            .padding(14.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            // Friend Info
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.weight(1f)
            ) {
                // Avatar with online dot
                Box {
                    Box(
                        contentAlignment = Alignment.Center,
                        modifier = Modifier
                            .size(44.dp)
                            .clip(CircleShape)
                            .background(avatarColor.copy(alpha = 0.2f))
                            .border(1.dp, avatarColor.copy(alpha = 0.5f), CircleShape)
                    ) {
                        Text(
                            text = friend.name.take(1).uppercase(),
                            color = avatarColor,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    if (friend.isOnline) {
                        Box(
                            modifier = Modifier
                                .size(11.dp)
                                .clip(CircleShape)
                                .background(EmeraldAccent)
                                .border(2.dp, DarkSurface, CircleShape)
                                .align(Alignment.BottomEnd)
                        )
                    }
                }

                Column {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text(
                            text = friend.name,
                            color = TextPrimary,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(4.dp))
                                .background(DarkSurfaceElevated)
                                .padding(horizontal = 4.dp, vertical = 1.dp)
                        ) {
                            Text(text = friend.friendCode, color = TextMuted, fontSize = 10.sp)
                        }
                    }
                    Text(
                        text = friend.lastMessage,
                        color = TextSecondary,
                        fontSize = 11.sp,
                        maxLines = 1,
                        modifier = Modifier.padding(top = 2.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.width(8.dp))

            // Actions: Text Chat and Direct Call
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                // Chat Button
                Box(
                    contentAlignment = Alignment.Center,
                    modifier = Modifier
                        .size(38.dp)
                        .clip(CircleShape)
                        .background(DarkSurfaceElevated)
                        .border(1.dp, DarkBorder, CircleShape)
                        .clickable { onOpenChat() }
                ) {
                    Icon(
                        imageVector = if (isSubscribed) Icons.AutoMirrored.Filled.Chat else Icons.Outlined.Lock,
                        contentDescription = "Chat",
                        tint = if (isSubscribed) PurpleLight else GoldLight,
                        modifier = Modifier.size(17.dp)
                    )
                }

                // Direct Call Button
                Box(
                    contentAlignment = Alignment.Center,
                    modifier = Modifier
                        .size(38.dp)
                        .clip(CircleShape)
                        .background(if (isSubscribed) EmeraldAccent else GoldSurface)
                        .border(1.dp, if (isSubscribed) EmeraldLight else GoldAccent, CircleShape)
                        .clickable { onDirectCall() }
                ) {
                    Icon(
                        imageVector = if (isSubscribed) Icons.Default.Phone else Icons.Default.Diamond,
                        contentDescription = "Direct Call",
                        tint = if (isSubscribed) Color.Black else GoldLight,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }
        }
    }
}
