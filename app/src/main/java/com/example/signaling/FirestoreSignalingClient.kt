package com.example.signaling

import android.util.Log
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ListenerRegistration
import com.google.firebase.firestore.SetOptions
import org.webrtc.IceCandidate
import org.webrtc.SessionDescription
import java.util.UUID

class FirestoreSignalingClient(
    var userId: String,
    var friendCode: String
) {

    companion object {
        private const val TAG = "SignalingClient"
        private const val COLLECTION_WAITING = "waiting_room"
        private const val COLLECTION_ROOMS = "rooms"
        private const val COLLECTION_INCOMING = "incoming_calls"
        private const val CANDIDATES_CALLER = "callerCandidates"
        private const val CANDIDATES_CALLEE = "calleeCandidates"
    }

    private val db: FirebaseFirestore? by lazy {
        try {
            FirebaseFirestore.getInstance()
        } catch (e: Exception) {
            Log.e(TAG, "FirebaseFirestore initialization fallback", e)
            null
        }
    }

    interface Callback {
        fun onMatchFound(roomId: String, isCaller: Boolean, partnerId: String)
        fun onOfferReceived(offer: SessionDescription)
        fun onAnswerReceived(answer: SessionDescription)
        fun onRemoteIceCandidateReceived(candidate: IceCandidate)
        fun onError(message: String)
    }

    private var callback: Callback? = null
    private var currentRoomId: String? = null
    private var isCaller: Boolean = false
    private var partnerId: String? = null

    private var waitingRoomListener: ListenerRegistration? = null
    private var roomListener: ListenerRegistration? = null
    private var candidatesListener: ListenerRegistration? = null
    private var incomingCallListener: ListenerRegistration? = null

    private var lastOfferSdp: String? = null
    private var lastAnswerSdp: String? = null
    private val seenIceKeys = mutableSetOf<String>()

    fun setCallback(cb: Callback) {
        this.callback = cb
        listenForIncomingCalls()
    }

    fun updateIdentity(newUserId: String, newFriendCode: String) {
        if (newUserId == userId && newFriendCode == friendCode) return
        incomingCallListener?.remove()
        incomingCallListener = null
        userId = newUserId
        friendCode = newFriendCode
        listenForIncomingCalls()
    }

    fun startMatchmaking() {
        resetSessionFlags()
        val firestore = db ?: run {
            callback?.onError("Firebase Firestore not initialized.")
            return
        }
        firestore.collection(COLLECTION_WAITING)
            .whereEqualTo("status", "waiting")
            .limit(8)
            .get()
            .addOnSuccessListener { querySnapshot ->
                val availablePeerDoc = querySnapshot.documents.firstOrNull { doc ->
                    doc.id != userId && doc.getString("status") == "waiting"
                }

                if (availablePeerDoc != null) {
                    pairWithPeer(availablePeerDoc.id)
                } else {
                    registerSelfAsWaiting()
                }
            }
            .addOnFailureListener { error ->
                Log.e(TAG, "Error querying waiting room", error)
                callback?.onError("Matchmaking query failed: ${error.localizedMessage}")
            }
    }

    fun startDirectCall(targetFriendCode: String) {
        resetSessionFlags()
        val firestore = db ?: run {
            callback?.onError("Firebase Firestore not initialized.")
            return
        }
        val cleanTarget = targetFriendCode.trim()
        if (cleanTarget.isEmpty() || cleanTarget.equals(friendCode, ignoreCase = true)) {
            callback?.onError("Invalid friend code for direct call.")
            return
        }

        val generatedRoomId = UUID.randomUUID().toString()
        isCaller = true
        partnerId = cleanTarget
        currentRoomId = generatedRoomId

        val roomData = hashMapOf(
            "roomId" to generatedRoomId,
            "callerId" to userId,
            "callerFriendCode" to friendCode,
            "calleeFriendCode" to cleanTarget,
            "type" to "direct",
            "createdAt" to FieldValue.serverTimestamp()
        )

        firestore.collection(COLLECTION_ROOMS).document(generatedRoomId)
            .set(roomData)
            .addOnSuccessListener {
                val invite = hashMapOf(
                    "fromUserId" to userId,
                    "fromFriendCode" to friendCode,
                    "roomId" to generatedRoomId,
                    "status" to "ringing",
                    "createdAt" to FieldValue.serverTimestamp()
                )
                firestore.collection(COLLECTION_INCOMING).document(cleanTarget)
                    .set(invite)
                    .addOnSuccessListener {
                        listenToRoomUpdates(generatedRoomId)
                        listenToRemoteCandidates(generatedRoomId, isCaller = true)
                        callback?.onMatchFound(generatedRoomId, true, cleanTarget)
                    }
                    .addOnFailureListener { error ->
                        callback?.onError("Failed to send call invite: ${error.localizedMessage}")
                    }
            }
            .addOnFailureListener { error ->
                callback?.onError("Failed to create call room: ${error.localizedMessage}")
            }
    }

    private fun listenForIncomingCalls() {
        val firestore = db ?: return
        val code = friendCode.trim()
        if (code.isEmpty()) return

        incomingCallListener?.remove()
        incomingCallListener = firestore.collection(COLLECTION_INCOMING).document(code)
            .addSnapshotListener { snapshot, error ->
                if (error != null || snapshot == null || !snapshot.exists()) return@addSnapshotListener
                val status = snapshot.getString("status")
                val roomId = snapshot.getString("roomId")
                val fromUserId = snapshot.getString("fromUserId")
                val fromFriendCode = snapshot.getString("fromFriendCode")
                if (status == "ringing" && roomId != null && fromUserId != null && fromUserId != userId) {
                    if (currentRoomId != null && currentRoomId != roomId) return@addSnapshotListener
                    snapshot.reference.update("status", "accepted")
                    acceptIncoming(roomId, fromUserId, fromFriendCode ?: fromUserId)
                }
            }
    }

    private fun acceptIncoming(roomId: String, fromUserId: String, partnerLabel: String) {
        if (currentRoomId != null && currentRoomId != roomId) return
        resetSessionFlags()
        isCaller = false
        currentRoomId = roomId
        partnerId = fromUserId
        listenToRoomUpdates(roomId)
        listenToRemoteCandidates(roomId, isCaller = false)
        callback?.onMatchFound(roomId, false, partnerLabel)
    }

    private fun pairWithPeer(peerId: String) {
        val firestore = db ?: return
        val generatedRoomId = UUID.randomUUID().toString()
        isCaller = true
        partnerId = peerId
        currentRoomId = generatedRoomId

        val peerRef = firestore.collection(COLLECTION_WAITING).document(peerId)
        firestore.runTransaction { transaction ->
            val snapshot = transaction.get(peerRef)
            val currentStatus = snapshot.getString("status")
            if (currentStatus == "waiting") {
                transaction.update(
                    peerRef,
                    mapOf(
                        "status" to "matched",
                        "roomId" to generatedRoomId,
                        "matchedWith" to userId
                    )
                )
                true
            } else {
                false
            }
        }.addOnSuccessListener { claimed ->
            if (claimed) {
                val roomData = hashMapOf(
                    "roomId" to generatedRoomId,
                    "callerId" to userId,
                    "calleeId" to peerId,
                    "type" to "random",
                    "createdAt" to FieldValue.serverTimestamp()
                )
                firestore.collection(COLLECTION_ROOMS).document(generatedRoomId)
                    .set(roomData)
                    .addOnSuccessListener {
                        listenToRoomUpdates(generatedRoomId)
                        listenToRemoteCandidates(generatedRoomId, isCaller = true)
                        callback?.onMatchFound(generatedRoomId, isCaller = true, partnerId = peerId)
                    }
            } else {
                registerSelfAsWaiting()
            }
        }.addOnFailureListener {
            registerSelfAsWaiting()
        }
    }

    private fun registerSelfAsWaiting() {
        val firestore = db ?: return
        isCaller = false
        val myWaitingDoc = firestore.collection(COLLECTION_WAITING).document(userId)
        val data = hashMapOf(
            "userId" to userId,
            "friendCode" to friendCode,
            "status" to "waiting",
            "createdAt" to FieldValue.serverTimestamp()
        )

        myWaitingDoc.set(data, SetOptions.merge()).addOnSuccessListener {
            waitingRoomListener?.remove()
            waitingRoomListener = myWaitingDoc.addSnapshotListener { snapshot, error ->
                if (error != null || snapshot == null || !snapshot.exists()) return@addSnapshotListener

                val status = snapshot.getString("status")
                val roomId = snapshot.getString("roomId")
                val matchedWith = snapshot.getString("matchedWith")

                if (status == "matched" && roomId != null && matchedWith != null) {
                    currentRoomId = roomId
                    partnerId = matchedWith
                    waitingRoomListener?.remove()
                    waitingRoomListener = null
                    listenToRoomUpdates(roomId)
                    listenToRemoteCandidates(roomId, isCaller = false)
                    callback?.onMatchFound(roomId, isCaller = false, partnerId = matchedWith)
                }
            }
        }.addOnFailureListener { error ->
            callback?.onError("Failed to enter waiting room: ${error.localizedMessage}")
        }
    }

    private fun listenToRoomUpdates(roomId: String) {
        val firestore = db ?: return
        roomListener?.remove()
        val roomDoc = firestore.collection(COLLECTION_ROOMS).document(roomId)
        roomListener = roomDoc.addSnapshotListener { snapshot, error ->
            if (error != null || snapshot == null || !snapshot.exists()) return@addSnapshotListener

            if (!isCaller) {
                val offerMap = snapshot.get("offer") as? Map<*, *>
                if (offerMap != null) {
                    val sdpType = offerMap["type"] as? String
                    val sdpDescription = offerMap["sdp"] as? String
                    if (sdpType != null && sdpDescription != null && sdpDescription != lastOfferSdp) {
                        lastOfferSdp = sdpDescription
                        val sessionDesc = SessionDescription(
                            SessionDescription.Type.fromCanonicalForm(sdpType.lowercase()),
                            sdpDescription
                        )
                        callback?.onOfferReceived(sessionDesc)
                    }
                }
            } else {
                val answerMap = snapshot.get("answer") as? Map<*, *>
                if (answerMap != null) {
                    val sdpType = answerMap["type"] as? String
                    val sdpDescription = answerMap["sdp"] as? String
                    if (sdpType != null && sdpDescription != null && sdpDescription != lastAnswerSdp) {
                        lastAnswerSdp = sdpDescription
                        val sessionDesc = SessionDescription(
                            SessionDescription.Type.fromCanonicalForm(sdpType.lowercase()),
                            sdpDescription
                        )
                        callback?.onAnswerReceived(sessionDesc)
                    }
                }
            }
        }
    }

    fun sendOffer(roomId: String, sdp: SessionDescription) {
        val firestore = db ?: return
        val offerData = mapOf(
            "type" to sdp.type.canonicalForm(),
            "sdp" to sdp.description
        )
        firestore.collection(COLLECTION_ROOMS).document(roomId)
            .update("offer", offerData)
            .addOnFailureListener { error ->
                Log.e(TAG, "Failed to send offer", error)
            }
    }

    fun sendAnswer(roomId: String, sdp: SessionDescription) {
        val firestore = db ?: return
        val answerData = mapOf(
            "type" to sdp.type.canonicalForm(),
            "sdp" to sdp.description
        )
        firestore.collection(COLLECTION_ROOMS).document(roomId)
            .update("answer", answerData)
            .addOnFailureListener { error ->
                Log.e(TAG, "Failed to send answer", error)
            }
    }

    fun sendIceCandidate(roomId: String, isCallerRole: Boolean, candidate: IceCandidate) {
        val firestore = db ?: return
        val subcollection = if (isCallerRole) CANDIDATES_CALLER else CANDIDATES_CALLEE
        val candidateData = hashMapOf(
            "sdpMid" to (candidate.sdpMid ?: ""),
            "sdpMLineIndex" to candidate.sdpMLineIndex,
            "sdp" to candidate.sdp,
            "senderId" to userId
        )
        firestore.collection(COLLECTION_ROOMS).document(roomId)
            .collection(subcollection)
            .add(candidateData)
    }

    private fun listenToRemoteCandidates(roomId: String, isCaller: Boolean) {
        val firestore = db ?: return
        val remoteSubcollection = if (isCaller) CANDIDATES_CALLEE else CANDIDATES_CALLER
        candidatesListener?.remove()
        candidatesListener = firestore.collection(COLLECTION_ROOMS).document(roomId)
            .collection(remoteSubcollection)
            .addSnapshotListener { snapshot, error ->
                if (error != null || snapshot == null) return@addSnapshotListener

                for (change in snapshot.documentChanges) {
                    if (change.type == com.google.firebase.firestore.DocumentChange.Type.ADDED) {
                        val doc = change.document
                        val sdpMid = doc.getString("sdpMid") ?: ""
                        val sdpMLineIndex = doc.getLong("sdpMLineIndex")?.toInt() ?: 0
                        val sdp = doc.getString("sdp") ?: ""
                        val iceKey = "$sdpMid|$sdpMLineIndex|$sdp"
                        if (sdp.isNotEmpty() && seenIceKeys.add(iceKey)) {
                            val candidate = IceCandidate(sdpMid, sdpMLineIndex, sdp)
                            callback?.onRemoteIceCandidateReceived(candidate)
                        }
                    }
                }
            }
    }

    fun cleanupFirestoreOnConnected() {
        val firestore = db ?: return
        Log.d(TAG, "WebRTC connected. Waiting room cleanup now; ICE docs later.")
        firestore.collection(COLLECTION_WAITING).document(userId).delete()
        partnerId?.let { firestore.collection(COLLECTION_WAITING).document(it).delete() }
        friendCode.takeIf { it.isNotBlank() }?.let {
            firestore.collection(COLLECTION_INCOMING).document(it).delete()
        }
    }

    fun cancelOrDisconnect() {
        val firestore = db
        detachSessionListeners()
        firestore?.collection(COLLECTION_WAITING)?.document(userId)?.delete()
        friendCode.takeIf { it.isNotBlank() }?.let {
            firestore?.collection(COLLECTION_INCOMING)?.document(it)?.delete()
        }
        currentRoomId?.let { roomId ->
            val roomRef = firestore?.collection(COLLECTION_ROOMS)?.document(roomId)
            roomRef?.collection(CANDIDATES_CALLER)?.get()?.addOnSuccessListener { snaps ->
                for (doc in snaps.documents) {
                    doc.reference.delete()
                }
            }
            roomRef?.collection(CANDIDATES_CALLEE)?.get()?.addOnSuccessListener { snaps ->
                for (doc in snaps.documents) {
                    doc.reference.delete()
                }
            }
            roomRef?.delete()
        }
        currentRoomId = null
        partnerId = null
        resetSessionFlags()
    }

    private fun detachSessionListeners() {
        waitingRoomListener?.remove()
        waitingRoomListener = null
        roomListener?.remove()
        roomListener = null
        candidatesListener?.remove()
        candidatesListener = null
    }

    private fun resetSessionFlags() {
        lastOfferSdp = null
        lastAnswerSdp = null
        seenIceKeys.clear()
    }
}
