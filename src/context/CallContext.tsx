
import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import socketService from '../services/socketService';
import toast from 'react-hot-toast';

// --- Types ---
type CallState = 'IDLE' | 'INCOMING' | 'OUTGOING' | 'ACTIVE' | 'ENDING';
type CallType = 'video' | 'audio';

interface RemoteUser {
    id: string;
    username: string;
    avatar?: string;
}

interface CallContextType {
    callState: CallState;
    callType: CallType;
    remoteUser: RemoteUser | null;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    isAudioEnabled: boolean;
    isVideoEnabled: boolean;

    makeCall: (userId: string, type: CallType, username?: string, avatar?: string) => Promise<void>;
    answerCall: () => Promise<void>;
    rejectCall: () => void;
    endCall: () => void;
    toggleAudio: () => void;
    toggleVideo: () => void;
    switchCamera: () => void; // Placeholder for mobile, maybe useful
}

// --- Context ---
const CallContext = createContext<CallContextType | undefined>(undefined);

export const useCall = () => {
    const context = useContext(CallContext);
    if (!context) throw new Error('useCall must be used within CallProvider');
    return context;
};

// --- Configuration ---
const RTC_CONFIG: RTCConfiguration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
    ],
    iceCandidatePoolSize: 10,
};

// --- Provider ---
export const CallProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // UI State
    const [callState, setCallState] = useState<CallState>('IDLE');
    const [callType, setCallType] = useState<CallType>('video');
    const [remoteUser, setRemoteUser] = useState<RemoteUser | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);

    // Refs for stable access in callbacks
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const callIdRef = useRef<string | null>(null);
    const pendingCandidatesRef = useRef<RTCIceCandidate[]>([]);
    const localCandidatesQueueRef = useRef<RTCIceCandidate[]>([]);
    const callStateRef = useRef<CallState>('IDLE');

    // Update state and ref
    const updateCallState = (newState: CallState) => {
        setCallState(newState);
        callStateRef.current = newState;
    };

    // --- Helper: Get Media ---
    const getMedia = async (type: CallType): Promise<MediaStream | null> => {
        try {
            const constraints: MediaStreamConstraints = {
                audio: true,
                video: type === 'video' ? {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                } : false
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            setLocalStream(stream);
            localStreamRef.current = stream;

            // Re-enable tracks if disabled previously
            stream.getAudioTracks().forEach(t => t.enabled = true);
            if (type === 'video') stream.getVideoTracks().forEach(t => t.enabled = true);

            setIsAudioEnabled(true);
            setIsVideoEnabled(type === 'video');
            return stream;
        } catch (err) {
            console.error('Media Access Error:', err);
            toast.error('Could not access Camera/Microphone. Please allow permissions.');
            return null;
        }
    };

    // --- Helper: Create Peer Connection ---
    const createPeer = () => {
        if (pcRef.current) return pcRef.current;

        console.log('Creating new RTCPeerConnection');
        const pc = new RTCPeerConnection(RTC_CONFIG);

        // 1. Handle ICE Candidates
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                if (callIdRef.current && remoteUser) {
                    socketService.sendIceCandidate({
                        callId: callIdRef.current,
                        candidate: event.candidate,
                        to: remoteUser.id
                    });
                } else {
                    console.log('Queueing local candidate (no callId/remoteUser)');
                    localCandidatesQueueRef.current.push(event.candidate);
                }
            }
        };

        // 2. Handle Remote Stream
        pc.ontrack = (event) => {
            console.log('Remote Track Received:', event.track.kind);
            if (event.streams && event.streams[0]) {
                setRemoteStream(event.streams[0]);
            } else {
                // If stream is not grouped, create a new one
                const newStream = new MediaStream();
                newStream.addTrack(event.track);
                setRemoteStream(newStream);
            }
        };

        // 3. Connection State
        pc.onconnectionstatechange = () => {
            console.log('Connection State:', pc.connectionState);
            if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                toast.error('Connection lost');
                cleanup();
            }
        };

        pcRef.current = pc;
        return pc;
    };

    // --- Cleanup ---
    const cleanup = useCallback(() => {
        // Stop Local Stream
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                track.stop();
            });
        }

        // Close PC
        if (pcRef.current) {
            pcRef.current.ontrack = null;
            pcRef.current.onicecandidate = null;
            pcRef.current.onconnectionstatechange = null;
            pcRef.current.close();
        }

        // Reset State
        updateCallState('IDLE');
        setLocalStream(null);
        setRemoteStream(null);
        setRemoteUser(null);
        setIsAudioEnabled(true);
        setIsVideoEnabled(true);

        // Reset Refs
        pcRef.current = null;
        localStreamRef.current = null;
        callIdRef.current = null;
        pendingCandidatesRef.current = [];
        localCandidatesQueueRef.current = [];
    }, []);

    // --- Actions ---

    // 1. Make Call
    const makeCall = async (userId: string, type: CallType, username?: string, avatar?: string) => {
        if (callState !== 'IDLE') {
            toast('You are already in a call');
            return;
        }

        setRemoteUser({ id: userId, username: username || 'User', avatar });
        setCallType(type);
        updateCallState('OUTGOING'); // Show UI immediately

        const stream = await getMedia(type);
        if (!stream) {
            cleanup();
            return;
        }

        const pc = createPeer();
        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        try {
            const offer = await pc.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: type === 'video'
            });
            await pc.setLocalDescription(offer);

            socketService.initiateCall({
                to: userId,
                callType: type,
                signal: offer
            }, (response: any) => {
                // Check if user cancelled while waiting using Ref
                if (callStateRef.current !== 'OUTGOING') {
                    // If cancelled, end the call on server if created
                    if (response?.success && response.callId) {
                        socketService.endCall({ callId: response.callId });
                    }
                    return;
                }

                if (response?.success) {
                    callIdRef.current = response.callId;
                    console.log('Call initiated. Flushing local candidates:', localCandidatesQueueRef.current.length);

                    // Flush local candidates
                    while (localCandidatesQueueRef.current.length > 0) {
                        const candidate = localCandidatesQueueRef.current.shift();
                        if (candidate) {
                            socketService.sendIceCandidate({
                                callId: response.callId,
                                candidate: candidate,
                                to: userId
                            });
                        }
                    }

                } else {
                    toast.error('Failed to connect call');
                    cleanup();
                }
            });

        } catch (e) {
            console.error('Make Call Error:', e);
            toast.error('Call failed');
            cleanup();
        }
    };

    // Need a ref for pending offer since we answer interactively
    const pendingOfferRef = useRef<any>(null);

    // Re-impl Answer logic
    const answerCallLogic = async () => {
        if (!pendingOfferRef.current) return;

        const stream = await getMedia(callType);
        if (!stream) {
            cleanup();
            socketService.rejectCall({ callId: callIdRef.current! });
            return;
        }

        const pc = createPeer();
        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        try {
            await pc.setRemoteDescription(new RTCSessionDescription(pendingOfferRef.current));

            // Process queued candidates
            while (pendingCandidatesRef.current.length) {
                const candidate = pendingCandidatesRef.current.shift();
                if (candidate) await pc.addIceCandidate(candidate);
            }

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            updateCallState('ACTIVE'); // Transition UI

            socketService.answerCall({
                callId: callIdRef.current!,
                signal: answer
            });

        } catch (e) {
            console.error('Answer Call Error:', e);
            cleanup();
        }
    };

    // 3. Reject/End
    const rejectCall = () => {
        if (callIdRef.current) {
            socketService.rejectCall({ callId: callIdRef.current });
        }
        cleanup();
    };

    const endCall = () => {
        if (callIdRef.current) {
            socketService.endCall({ callId: callIdRef.current });
        }
        cleanup();
    };

    // 4. Toggles
    const toggleAudio = () => {
        if (localStreamRef.current) {
            const track = localStreamRef.current.getAudioTracks()[0];
            if (track) {
                track.enabled = !track.enabled;
                setIsAudioEnabled(track.enabled);
                // Inform peer? socketService.toggleMedia...
            }
        }
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            const track = localStreamRef.current.getVideoTracks()[0];
            if (track) {
                track.enabled = !track.enabled;
                setIsVideoEnabled(track.enabled);
                // Inform peer?
            }
        }
    };

    const switchCamera = () => {
        // Advanced: Requires re-gum and replaceTrack. Skipping for basic MVP.
        toast('Switch camera not implemented yet');
    };

    // --- Socket Listeners ---
    useEffect(() => {
        const onIncoming = (data: any) => {
            // data: { callId, from, callType, signal, callerName }
            if (callState !== 'IDLE') {
                // Busy
                socketService.rejectCall({ callId: data.callId });
                return;
            }

            console.log('Incoming Call:', data);
            callIdRef.current = data.callId;
            setRemoteUser({ id: data.from, username: data.callerName || 'Caller' });
            setCallType(data.callType);
            pendingOfferRef.current = data.signal;
            updateCallState('INCOMING');
        };

        const onAnswered = async (data: any) => {
            // data: { callId, signal, from }
            if (callStateRef.current === 'OUTGOING') {
                console.log('Call Answered by remote');
                const pc = pcRef.current;
                if (pc) {
                    try {
                        await pc.setRemoteDescription(new RTCSessionDescription(data.signal));
                        updateCallState('ACTIVE');

                        // Process queued candidates
                        while (pendingCandidatesRef.current.length) {
                            const candidate = pendingCandidatesRef.current.shift();
                            if (candidate) await pc.addIceCandidate(candidate);
                        }
                    } catch (e) {
                        console.error('Set Remote Desc Error:', e);
                    }
                }
            }
        };

        const onIceCandidate = async (data: any) => {
            // data: { callId, candidate }
            // Verify call ID?
            // if (data.callId !== callIdRef.current) return; // Strict check

            const candidate = new RTCIceCandidate(data.candidate);
            const pc = pcRef.current;

            if (pc && pc.remoteDescription) {
                try {
                    await pc.addIceCandidate(candidate);
                } catch (e) {
                    console.error('Add Ice Error:', e);
                }
            } else {
                pendingCandidatesRef.current.push(candidate);
            }
        };

        const onHangup = () => {
            toast('Call Ended');
            cleanup();
        };

        socketService.onIncomingCall(onIncoming);
        socketService.onCallAnswered(onAnswered);
        socketService.onIceCandidate(onIceCandidate);
        socketService.onCallRejected(onHangup);
        socketService.onCallEnded(onHangup);

        return () => {
            socketService.off('call:incoming', onIncoming);
            socketService.off('call:answered', onAnswered);
            socketService.off('call:ice-candidate', onIceCandidate);
            socketService.off('call:rejected', onHangup);
            socketService.off('call:ended', onHangup);
        };
    }, [callState, cleanup]);

    return (
        <CallContext.Provider value={{
            callState,
            callType,
            remoteUser,
            localStream,
            remoteStream,
            isAudioEnabled,
            isVideoEnabled,
            makeCall,
            answerCall: answerCallLogic,
            rejectCall,
            endCall,
            toggleAudio,
            toggleVideo,
            switchCamera
        }}>
            {children}
        </CallContext.Provider>
    );
};
