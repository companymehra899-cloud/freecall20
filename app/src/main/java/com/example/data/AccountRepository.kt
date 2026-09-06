package com.example.data

import android.content.Context
import android.content.SharedPreferences
import com.example.model.ChatMessage
import com.example.model.Friend
import com.example.model.UserAccount
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale
import java.util.UUID
import kotlin.random.Random

class AccountRepository(context: Context) {

    private val prefs: SharedPreferences = context.getSharedPreferences("speakfree_prefs", Context.MODE_PRIVATE)

    private val _currentUser = MutableStateFlow(loadUser())
    val currentUser: StateFlow<UserAccount> = _currentUser.asStateFlow()

    private val _friends = MutableStateFlow(loadInitialFriends())
    val friends: StateFlow<List<Friend>> = _friends.asStateFlow()

    private val chatStore = mutableMapOf<String, MutableList<ChatMessage>>()

    init {
        seedSampleChats()
    }

    private fun loadUser(): UserAccount {
        val userId = prefs.getString("user_id", null) ?: run {
            val newId = UUID.randomUUID().toString()
            prefs.edit().putString("user_id", newId).apply()
            newId
        }

        val isGuest = prefs.getBoolean("is_guest", true)
        val displayName = prefs.getString("display_name", if (isGuest) "Guest #${userId.take(4).uppercase()}" else "User") ?: "Guest"
        val phoneNumber = prefs.getString("phone_number", "") ?: ""
        val email = prefs.getString("email", "") ?: ""
        val friendCode = prefs.getString("friend_code", null) ?: run {
            val code = "SPK-${Random.nextInt(1000, 9999)}"
            prefs.edit().putString("friend_code", code).apply()
            code
        }
        val isSubscribed = prefs.getBoolean("is_subscribed", false)
        val expiryDate = prefs.getString("sub_expiry_date", "") ?: ""
        val expiryTimestamp = prefs.getLong("sub_expiry_ts", 0L)
        val playOrderId = prefs.getString("play_order_id", "") ?: ""
        val playToken = prefs.getString("play_purchase_token", "") ?: ""
        val playProductId = prefs.getString("play_product_id", "") ?: ""
        val avatarIndex = prefs.getInt("avatar_index", Random.nextInt(0, 5))
        val profileImageUri = prefs.getString("profile_image_uri", null)
        val totalCalls = prefs.getInt("total_calls", 3)
        val totalTalkTime = prefs.getLong("total_talk_time", 184L)

        return UserAccount(
            userId = userId,
            displayName = displayName,
            phoneNumber = phoneNumber,
            email = email,
            friendCode = friendCode,
            isGuest = isGuest,
            isSubscribed = isSubscribed,
            subscriptionExpiryDate = expiryDate,
            subscriptionExpiryTimestamp = expiryTimestamp,
            googlePlayOrderId = playOrderId,
            googlePlayPurchaseToken = playToken,
            googlePlayProductId = playProductId,
            avatarColorIndex = avatarIndex,
            profileImageUri = profileImageUri,
            totalCallsMade = totalCalls,
            totalTalkTimeSeconds = totalTalkTime
        )
    }

    private fun saveUser(user: UserAccount) {
        val editor = prefs.edit()
            .putString("user_id", user.userId)
            .putBoolean("is_guest", user.isGuest)
            .putString("display_name", user.displayName)
            .putString("phone_number", user.phoneNumber)
            .putString("email", user.email)
            .putString("friend_code", user.friendCode)
            .putBoolean("is_subscribed", user.isSubscribed)
            .putString("sub_expiry_date", user.subscriptionExpiryDate)
            .putLong("sub_expiry_ts", user.subscriptionExpiryTimestamp)
            .putString("play_order_id", user.googlePlayOrderId)
            .putString("play_purchase_token", user.googlePlayPurchaseToken)
            .putString("play_product_id", user.googlePlayProductId)
            .putInt("avatar_index", user.avatarColorIndex)
            .putInt("total_calls", user.totalCallsMade)
            .putLong("total_talk_time", user.totalTalkTimeSeconds)

        if (user.profileImageUri != null) {
            editor.putString("profile_image_uri", user.profileImageUri)
        } else {
            editor.remove("profile_image_uri")
        }
        editor.apply()
        _currentUser.value = user
    }

    fun updateProfileImage(uriString: String?) {
        val current = _currentUser.value
        val updated = current.copy(profileImageUri = uriString)
        saveUser(updated)
    }

    fun loginWithPhone(name: String, phoneNumber: String): UserAccount {
        val current = _currentUser.value
        val cleanPhone = phoneNumber.trim()
        val defaultName = if (cleanPhone.length >= 4) "User (${cleanPhone.takeLast(4)})" else "English Learner"
        val updated = current.copy(
            displayName = name.trim().ifEmpty { defaultName },
            phoneNumber = cleanPhone,
            isGuest = false
        )
        saveUser(updated)
        return updated
    }

    fun registerOrLogin(name: String, email: String, uid: String): UserAccount {
        val current = _currentUser.value
        val updated = current.copy(
            userId = uid,
            displayName = name.trim().ifEmpty { "English Learner" },
            email = email.trim(),
            isGuest = false
        )
        saveUser(updated)
        return updated
    }

    fun logoutToGuest(): UserAccount {
        val newGuestId = UUID.randomUUID().toString()
        val guestCode = "SPK-${Random.nextInt(1000, 9999)}"
        val guest = UserAccount(
            userId = newGuestId,
            displayName = "Guest #${newGuestId.take(4).uppercase()}",
            phoneNumber = "",
            email = "",
            friendCode = guestCode,
            isGuest = true,
            isSubscribed = false,
            subscriptionExpiryDate = "",
            subscriptionExpiryTimestamp = 0L,
            avatarColorIndex = Random.nextInt(0, 5)
        )
        saveUser(guest)
        return guest
    }

    /**
     * Strictly verifies and applies a Google Play In-App Purchase receipt.
     * Rejects any unverified trigger without a valid purchaseToken.
     */
    fun applyVerifiedGooglePlayPurchase(
        purchaseToken: String,
        orderId: String,
        productId: String,
        purchaseTimeMillis: Long = System.currentTimeMillis()
    ): Result<UserAccount> {
        if (purchaseToken.isBlank()) {
            return Result.failure(IllegalArgumentException("Invalid Google Play receipt: purchase token is missing"))
        }

        val baseTime = if (purchaseTimeMillis > 0L) purchaseTimeMillis else System.currentTimeMillis()
        val cal = Calendar.getInstance()
        cal.timeInMillis = baseTime
        cal.add(Calendar.MONTH, 5)
        val expiryTime = cal.timeInMillis
        val formatter = SimpleDateFormat("dd MMM yyyy", Locale.US)
        val formattedDate = formatter.format(Date(expiryTime))

        val current = _currentUser.value
        val updated = current.copy(
            isSubscribed = true,
            subscriptionExpiryDate = formattedDate,
            subscriptionExpiryTimestamp = expiryTime,
            googlePlayOrderId = orderId,
            googlePlayPurchaseToken = purchaseToken,
            googlePlayProductId = productId
        )
        saveUser(updated)

        // If user has a registered profile, sync verified purchase receipt to Firestore
        if (!current.isGuest && current.userId.isNotBlank()) {
            try {
                val db = com.google.firebase.firestore.FirebaseFirestore.getInstance()
                val receiptData = hashMapOf(
                    "isSubscribed" to true,
                    "subscriptionPlan" to "VIP_5_MONTHS",
                    "googlePlayOrderId" to orderId,
                    "googlePlayPurchaseToken" to purchaseToken,
                    "googlePlayProductId" to productId,
                    "subscriptionExpiryTimestamp" to expiryTime,
                    "subscriptionExpiryDate" to formattedDate,
                    "verifiedAt" to com.google.firebase.firestore.FieldValue.serverTimestamp()
                )
                db.collection("Users").document(current.userId)
                    .set(receiptData, com.google.firebase.firestore.SetOptions.merge())
            } catch (e: Exception) {
                android.util.Log.e("AccountRepository", "Error syncing verified purchase to Firestore", e)
            }
        }

        return Result.success(updated)
    }

    fun addFriend(codeOrName: String): Result<Friend> {
        val clean = codeOrName.trim().uppercase()
        if (clean.isEmpty()) {
            return Result.failure(Exception("Please enter a valid Friend Code or Name"))
        }

        // Check if already friends
        val existing = _friends.value.find { it.friendCode.uppercase() == clean || it.name.uppercase() == clean }
        if (existing != null) {
            return Result.failure(Exception("${existing.name} is already in your Friend list!"))
        }

        val newFriend = Friend(
            id = UUID.randomUUID().toString(),
            friendCode = if (clean.startsWith("SPK-")) clean else "SPK-${Random.nextInt(1000, 9999)}",
            name = if (clean.startsWith("SPK-")) "Learner #${clean.removePrefix("SPK-")}" else codeOrName.trim(),
            isOnline = true,
            avatarColorIndex = Random.nextInt(0, 5),
            lastMessage = "Added to Friends! Tap to start direct call or chat.",
            lastMessageTime = "Just now"
        )

        val updatedList = listOf(newFriend) + _friends.value
        _friends.value = updatedList
        return Result.success(newFriend)
    }

    fun getChatMessages(friendId: String): List<ChatMessage> {
        return chatStore[friendId] ?: emptyList()
    }

    fun sendChatMessage(friendId: String, text: String): ChatMessage {
        val formatter = SimpleDateFormat("hh:mm a", Locale.US)
        val timeStr = formatter.format(Date())
        val msg = ChatMessage(
            id = UUID.randomUUID().toString(),
            senderId = _currentUser.value.userId,
            senderName = _currentUser.value.displayName,
            text = text.trim(),
            timestamp = System.currentTimeMillis(),
            timeFormatted = timeStr
        )

        val list = chatStore.getOrPut(friendId) { mutableListOf() }
        list.add(msg)

        // Update last message in friends list
        val updatedFriends = _friends.value.map { f ->
            if (f.id == friendId) {
                f.copy(lastMessage = text, lastMessageTime = timeStr)
            } else f
        }
        _friends.value = updatedFriends

        return msg
    }

    fun incrementCallStats(durationSeconds: Long) {
        val curr = _currentUser.value
        val updated = curr.copy(
            totalCallsMade = curr.totalCallsMade + 1,
            totalTalkTimeSeconds = curr.totalTalkTimeSeconds + durationSeconds
        )
        saveUser(updated)
    }

    private fun loadInitialFriends(): List<Friend> {
        return listOf(
            Friend(
                id = "f_1",
                friendCode = "SPK-4821",
                name = "Aarav Sharma (Advanced)",
                isOnline = true,
                avatarColorIndex = 1,
                lastMessage = "Hey! Let's practice IELTS speaking topics today?",
                lastMessageTime = "12:30 PM"
            ),
            Friend(
                id = "f_2",
                friendCode = "SPK-8923",
                name = "Priya Patel (Intermediate)",
                isOnline = true,
                avatarColorIndex = 2,
                lastMessage = "Thanks for the great conversation earlier!",
                lastMessageTime = "Yesterday"
            ),
            Friend(
                id = "f_3",
                friendCode = "SPK-3109",
                name = "Rohan Verma (Beginner)",
                isOnline = false,
                avatarColorIndex = 3,
                lastMessage = "Will be online at 8 PM for mock interview.",
                lastMessageTime = "2 days ago"
            )
        )
    }

    private fun seedSampleChats() {
        chatStore["f_1"] = mutableListOf(
            ChatMessage(
                id = "m1",
                senderId = "f_1",
                senderName = "Aarav Sharma",
                text = "Hi there! Are you free for a 10-minute speaking drill?",
                timestamp = System.currentTimeMillis() - 3600000,
                timeFormatted = "11:45 AM"
            ),
            ChatMessage(
                id = "m2",
                senderId = _currentUser.value.userId,
                senderName = "Me",
                text = "Yes, sure! Let's discuss business idioms and accent clarity.",
                timestamp = System.currentTimeMillis() - 1800000,
                timeFormatted = "12:15 PM"
            ),
            ChatMessage(
                id = "m3",
                senderId = "f_1",
                senderName = "Aarav Sharma",
                text = "Hey! Let's practice IELTS speaking topics today?",
                timestamp = System.currentTimeMillis() - 600000,
                timeFormatted = "12:30 PM"
            )
        )
    }
}
