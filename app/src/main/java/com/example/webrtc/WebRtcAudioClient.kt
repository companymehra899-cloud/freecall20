package com.example.webrtc

import android.content.Context
import android.util.Log
import com.example.BuildConfig
import org.webrtc.AudioSource
import org.webrtc.AudioTrack
import org.webrtc.IceCandidate
import org.webrtc.MediaConstraints
import org.webrtc.MediaStream
import org.webrtc.PeerConnection
import org.webrtc.PeerConnection.IceServer
import org.webrtc.PeerConnection.PeerConnectionState
import org.webrtc.PeerConnectionFactory
import org.webrtc.RtpReceiver
import org.webrtc.SdpObserver
import org.webrtc.SessionDescription

class WebRtcAudioClient(
    private val context: Context,
    private val listener: Listener
) {

    interface Listener {
        fun onLocalDescriptionCreated(desc: SessionDescription)
        fun onIceCandidateGenerated(candidate: IceCandidate)
        fun onPeerConnected()
        fun onPeerDisconnected()
        fun onError(description: String)
    }

    companion object {
        private const val TAG = "WebRtcAudio"
        private const val AUDIO_TRACK_ID = "ARDAMSa0"
        private const val MEDIA_STREAM_ID = "ARDAMS"

        @Volatile
        private var factoryInitialized = false

        private fun ensureFactoryInitialized(context: Context) {
            if (factoryInitialized) return
            synchronized(this) {
                if (factoryInitialized) return
                val options = PeerConnectionFactory.InitializationOptions.builder(context.applicationContext)
                    .setEnableInternalTracer(false)
                    .createInitializationOptions()
                PeerConnectionFactory.initialize(options)
                factoryInitialized = true
            }
        }

        private fun iceServers(): List<IceServer> {
            val servers = mutableListOf<IceServer>()
            servers += IceServer.builder("stun:stun.l.google.com:19302").createIceServer()
            servers += IceServer.builder("stun:stun1.l.google.com:19302").createIceServer()
            servers += IceServer.builder("stun:stun2.l.google.com:19302").createIceServer()

            val username = runCatching { BuildConfig.TURN_USERNAME }.getOrDefault("").trim()
            val password = runCatching { BuildConfig.TURN_PASSWORD }.getOrDefault("").trim()
            val urls = listOf(
                runCatching { BuildConfig.TURN_URL }.getOrDefault(""),
                runCatching { BuildConfig.TURN_URL_UDP }.getOrDefault(""),
                runCatching { BuildConfig.TURN_URL_TCP }.getOrDefault(""),
                runCatching { BuildConfig.TURN_URL_TLS }.getOrDefault("")
            ).map { it.trim() }.filter { it.isNotEmpty() }.distinct()

            for (url in urls) {
                val builder = IceServer.builder(url)
                if (username.isNotEmpty()) {
                    builder.setUsername(username).setPassword(password)
                }
                servers += builder.createIceServer()
            }
            return servers
        }
    }

    private var peerConnectionFactory: PeerConnectionFactory? = null
    private var peerConnection: PeerConnection? = null
    private var localAudioSource: AudioSource? = null
    private var localAudioTrack: AudioTrack? = null

    private var isConnectedTriggered = false
    @Volatile private var isClosing = false
    @Volatile private var remoteDescriptionSet = false
    private val pendingRemoteIce = mutableListOf<IceCandidate>()

    init {
        ensureFactoryInitialized(context)
        val factoryOptions = PeerConnectionFactory.Options()
        peerConnectionFactory = PeerConnectionFactory.builder()
            .setOptions(factoryOptions)
            .createPeerConnectionFactory()
    }

    fun startLocalAudio() {
        if (localAudioTrack != null) return
        val factory = peerConnectionFactory ?: return

        val audioConstraints = MediaConstraints().apply {
            mandatory.add(MediaConstraints.KeyValuePair("googEchoCancellation", "true"))
            mandatory.add(MediaConstraints.KeyValuePair("googAutoGainControl", "true"))
            mandatory.add(MediaConstraints.KeyValuePair("googHighpassFilter", "true"))
            mandatory.add(MediaConstraints.KeyValuePair("googNoiseSuppression", "true"))
        }

        localAudioSource = factory.createAudioSource(audioConstraints)
        localAudioTrack = factory.createAudioTrack(AUDIO_TRACK_ID, localAudioSource).apply {
            setEnabled(true)
        }
    }

    fun initPeerConnection() {
        isClosing = false
        isConnectedTriggered = false
        remoteDescriptionSet = false
        pendingRemoteIce.clear()

        peerConnection?.let {
            try {
                it.close()
                it.dispose()
            } catch (_: Exception) {
            }
            peerConnection = null
        }

        val rtcConfig = PeerConnection.RTCConfiguration(iceServers()).apply {
            iceTransportsType = PeerConnection.IceTransportsType.ALL
            bundlePolicy = PeerConnection.BundlePolicy.MAXBUNDLE
            rtcpMuxPolicy = PeerConnection.RtcpMuxPolicy.REQUIRE
            continualGatheringPolicy = PeerConnection.ContinualGatheringPolicy.GATHER_CONTINUALLY
            keyType = PeerConnection.KeyType.ECDSA
            sdpSemantics = PeerConnection.SdpSemantics.UNIFIED_PLAN
        }

        peerConnection = peerConnectionFactory?.createPeerConnection(rtcConfig, object : PeerConnection.Observer {
            override fun onSignalingChange(state: PeerConnection.SignalingState?) {}

            override fun onIceConnectionChange(state: PeerConnection.IceConnectionState?) {
                if (isClosing) return
                when (state) {
                    PeerConnection.IceConnectionState.CONNECTED,
                    PeerConnection.IceConnectionState.COMPLETED -> notifyConnectedOnce()
                    PeerConnection.IceConnectionState.FAILED -> listener.onPeerDisconnected()
                    else -> {}
                }
            }

            override fun onConnectionChange(newState: PeerConnectionState?) {
                if (isClosing) return
                when (newState) {
                    PeerConnectionState.CONNECTED -> notifyConnectedOnce()
                    PeerConnectionState.FAILED -> listener.onPeerDisconnected()
                    else -> {}
                }
            }

            override fun onIceConnectionReceivingChange(receiving: Boolean) {}
            override fun onIceGatheringChange(state: PeerConnection.IceGatheringState?) {}

            override fun onIceCandidate(candidate: IceCandidate?) {
                if (isClosing) return
                candidate?.let { listener.onIceCandidateGenerated(it) }
            }

            override fun onIceCandidatesRemoved(candidates: Array<out IceCandidate>?) {}
            override fun onAddStream(stream: MediaStream?) {}
            override fun onRemoveStream(stream: MediaStream?) {}
            override fun onDataChannel(dataChannel: org.webrtc.DataChannel?) {}
            override fun onRenegotiationNeeded() {}
            override fun onAddTrack(receiver: RtpReceiver?, mediaStreams: Array<out MediaStream>?) {}
        })

        localAudioTrack?.let { track ->
            peerConnection?.addTrack(track, listOf(MEDIA_STREAM_ID))
        }
    }

    private fun notifyConnectedOnce() {
        if (!isConnectedTriggered && !isClosing) {
            isConnectedTriggered = true
            listener.onPeerConnected()
        }
    }

    fun createOffer() {
        val sdpConstraints = MediaConstraints().apply {
            mandatory.add(MediaConstraints.KeyValuePair("OfferToReceiveAudio", "true"))
            mandatory.add(MediaConstraints.KeyValuePair("OfferToReceiveVideo", "false"))
        }

        peerConnection?.createOffer(object : SimpleSdpObserver() {
            override fun onCreateSuccess(p0: SessionDescription?) {
                p0?.let {
                    peerConnection?.setLocalDescription(SimpleSdpObserver(), it)
                    listener.onLocalDescriptionCreated(it)
                }
            }

            override fun onCreateFailure(p0: String?) {
                listener.onError("Failed to create WebRTC offer: $p0")
            }
        }, sdpConstraints)
    }

    fun handleRemoteOfferAndCreateAnswer(remoteDesc: SessionDescription) {
        peerConnection?.setRemoteDescription(object : SimpleSdpObserver() {
            override fun onSetSuccess() {
                markRemoteDescriptionSet()
                val sdpConstraints = MediaConstraints().apply {
                    mandatory.add(MediaConstraints.KeyValuePair("OfferToReceiveAudio", "true"))
                    mandatory.add(MediaConstraints.KeyValuePair("OfferToReceiveVideo", "false"))
                }

                peerConnection?.createAnswer(object : SimpleSdpObserver() {
                    override fun onCreateSuccess(p0: SessionDescription?) {
                        p0?.let {
                            peerConnection?.setLocalDescription(SimpleSdpObserver(), it)
                            listener.onLocalDescriptionCreated(it)
                        }
                    }

                    override fun onCreateFailure(p0: String?) {
                        listener.onError("Failed to create WebRTC answer: $p0")
                    }
                }, sdpConstraints)
            }

            override fun onSetFailure(p0: String?) {
                listener.onError("Failed to set remote offer: $p0")
            }
        }, remoteDesc)
    }

    fun setRemoteAnswer(remoteDesc: SessionDescription) {
        peerConnection?.setRemoteDescription(object : SimpleSdpObserver() {
            override fun onSetSuccess() {
                markRemoteDescriptionSet()
            }

            override fun onSetFailure(p0: String?) {
                listener.onError("Failed to set remote answer: $p0")
            }
        }, remoteDesc)
    }

    fun addRemoteIceCandidate(iceCandidate: IceCandidate) {
        if (isClosing) return
        if (remoteDescriptionSet && peerConnection != null) {
            peerConnection?.addIceCandidate(iceCandidate)
        } else {
            pendingRemoteIce.add(iceCandidate)
        }
    }

    private fun markRemoteDescriptionSet() {
        remoteDescriptionSet = true
        val queued = pendingRemoteIce.toList()
        pendingRemoteIce.clear()
        queued.forEach { candidate ->
            peerConnection?.addIceCandidate(candidate)
        }
    }

    fun setMicrophoneMute(isMuted: Boolean) {
        localAudioTrack?.setEnabled(!isMuted)
    }

    fun close() {
        isClosing = true
        remoteDescriptionSet = false
        pendingRemoteIce.clear()
        try {
            peerConnection?.close()
            peerConnection?.dispose()
            peerConnection = null

            localAudioTrack?.dispose()
            localAudioTrack = null

            localAudioSource?.dispose()
            localAudioSource = null
        } catch (e: Exception) {
            Log.w(TAG, "WebRTC teardown ignored", e)
        }
    }

    private open class SimpleSdpObserver : SdpObserver {
        override fun onCreateSuccess(p0: SessionDescription?) {}
        override fun onSetSuccess() {}
        override fun onCreateFailure(p0: String?) {}
        override fun onSetFailure(p0: String?) {}
    }
}
