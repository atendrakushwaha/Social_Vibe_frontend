import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import socketService from '../services/socketService';
import { useAppSelector } from '../store/hooks';
import toast from 'react-hot-toast';

interface CallContextType {
    makeCall: (userId: string, type: 'video' | 'audio', username?: string, avatar?: string) => void;
    endCall: () => void;
    answerCall: () => void;
    rejectCall: () => void;
    toggleVideo: () => void;
    toggleAudio: () => void;
    callState: CallState;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    callType: 'video' | 'audio';
    isAudioEnabled: boolean;
    isVideoEnabled: boolean;
    remoteUser: { id: string; username: string; avatar?: string } | null;
}

type CallState = 'IDLE' | 'INCOMING' | 'OUTGOING' | 'ACTIVE' | 'ENDING';

const CallContext = createContext<CallContextType | undefined>(undefined);

export const useCall = () => {
    const context = useContext(CallContext);
    if (!context) {
        throw new Error('useCall must be used within a CallProvider');
    }
    return context;
};

// Peer Connection Config (STUN servers)
const peerConfiguration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ],
};

export const CallProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const currentUser = useAppSelector(state => state.auth.user);
    const [callState, setCallState] = useState<CallState>('IDLE');
    const [callType, setCallType] = useState<'video' | 'audio'>('video');

    // Call Metadata
    const [callId, setCallId] = useState<string | null>(null);
    const [remoteUser, setRemoteUser] = useState<{ id: string; username: string; avatar?: string } | null>(null);

    // Media
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);

    // Refs for non-react state
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);

    // Initialize Peer Connection
    const createPeerConnection = () => {
        const pc = new RTCPeerConnection(peerConfiguration);

        pc.onicecandidate = (event) => {
            if (event.candidate && callId && remoteUser) {
                socketService.sendIceCandidate({
                    callId,
                    candidate: event.candidate,
                    to: remoteUser.id
                });
            }
        };

        pc.ontrack = (event) => {
            console.log('Incoming remote stream track', event.streams[0]);
            setRemoteStream(event.streams[0]);
        };

        // Handle connection state changes for cleanup
        pc.onconnectionstatechange = () => {
            if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
                endCall();
            }
        };

        peerConnectionRef.current = pc;
        return pc;
    };

    // Get Local Media
    const getMedia = async (type: 'video' | 'audio') => {
        try {
            const constraints = {
                audio: true,
                video: type === 'video'
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            setLocalStream(stream);
            localStreamRef.current = stream;

            // Add tracks to PC if exists
            if (peerConnectionRef.current) {
                stream.getTracks().forEach(track => {
                    peerConnectionRef.current?.addTrack(track, stream);
                });
            }
            return stream;
        } catch (error) {
            console.error('Error accessing media devices.', error);
            toast.error('Failed to access camera/microphone');
            endCall();
            return null;
        }
    };

    // Initiate Call
    const makeCall = async (userId: string, type: 'video' | 'audio', username?: string, avatar?: string) => {
        if (callState !== 'IDLE') return;

        setCallType(type);
        setRemoteUser({ id: userId, username: username || 'User', avatar });
        setCallState('OUTGOING');

        // Create PC
        const pc = createPeerConnection(); // No callId yet

        // Get Media
        const stream = await getMedia(type);
        if (!stream) return;

        // Create Offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // Send to server (we send offer as signal)
        socketService.initiateCall({
            to: userId,
            callType: type,
            signal: offer
        }, (response: any) => {
            if (response.success) {
                setCallId(response.callId);
                // Call successfully initiated
            } else {
                toast.error('Failed to initiate call');
                endCall();
            }
        });
    };

    // Handle Incoming Call
    useEffect(() => {
        const handleIncomingCall = (data: any) => {
            if (callState !== 'IDLE') {
                // Reject if busy
                // Ideally send 'busy' status back, currently just ignore or reject locally?
                // We could auto-reject via socketService.rejectCall if we had logic
                return;
            }

            setCallId(data.callId);
            setCallType(data.callType);
            setRemoteUser({ id: data.from, username: data.callerName || 'Unknown User' }); // callerName added in backend
            setCallState('INCOMING');

            // Store offer signal temporarily? It's in 'data.signal'.
            // We need it when answering.
            // We can store it in a ref or state if needed later, but here we likely won't process it until answer?
            // Wait, we need to setRemoteDescription to accept it later.
            // Let's store pendingOffer in a Ref
        };

        socketService.onIncomingCall(handleIncomingCall);

        return () => {
            // Cleanup listener? socketService.off logic needed
        };
    }, [callState]); // Rebind if state enters ACTIVE? No, just once.
    // Wait, use Ref for callState inside listener if needed, or depend on it.

    // Incoming Call Signal Ref
    const pendingOfferRef = useRef<any>(null);
    useEffect(() => {
        socketService.onIncomingCall((data) => {
            if (callState !== 'IDLE') {
                // Auto reject?
                socketService.rejectCall({ callId: data.callId });
                return;
            }
            pendingOfferRef.current = data.signal;
            setCallId(data.callId);
            setCallType(data.callType);
            setRemoteUser({ id: data.from, username: data.callerName || 'Unknown Caller' });
            setCallState('INCOMING');
        });

        socketService.onCallAnswered(async (data) => {
            if (callState === 'OUTGOING') {
                setCallState('ACTIVE');
                // Set Remote Description (Answer)
                if (peerConnectionRef.current) {
                    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.signal));
                }
            }
        });

        socketService.onCallRejected(() => {
            toast.error('Call rejected');
            endCall();
        });

        socketService.onCallEnded(() => {
            endCall();
        });

        socketService.onIceCandidate(async (data) => {
            if (peerConnectionRef.current && data.candidate) {
                try {
                    await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
                } catch (e) {
                    console.error('Error adding received ice candidate', e);
                }
            }
        });

        return () => {
            // socketService.off functions if available
        };
    }, [callState]); // Rerun if IDLE changes? Ideally stable.

    const answerCall = async () => {
        if (callState !== 'INCOMING' || !callId || !remoteUser) return;

        const pc = createPeerConnection();
        const stream = await getMedia(callType);
        if (!stream) return;

        // Set Remote Description (Offer)
        if (pendingOfferRef.current) {
            await pc.setRemoteDescription(new RTCSessionDescription(pendingOfferRef.current));
        }

        // Create Answer
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        setCallState('ACTIVE');

        // Send Answer
        socketService.answerCall({
            callId,
            signal: answer
        });
    };

    const rejectCall = () => {
        if (callId) {
            socketService.rejectCall({ callId });
        }
        cleanupCall();
    };

    const endCall = () => {
        if (callId) {
            socketService.endCall({ callId });
        }
        cleanupCall();
    };

    const cleanupCall = () => {
        setCallState('IDLE');
        setCallId(null);
        setRemoteUser(null);
        setLocalStream(null);
        setRemoteStream(null);

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }

        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
        pendingOfferRef.current = null;
    };

    // Toggle Media
    const toggleVideo = () => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoEnabled(videoTrack.enabled);
                // Send update to peer if needed
            }
        }
    }

    const toggleAudio = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioEnabled(audioTrack.enabled);
            }
        }
    }

    return (
        <CallContext.Provider value={{
            makeCall,
            endCall,
            answerCall,
            rejectCall,
            toggleVideo,
            toggleAudio,
            callState,
            localStream,
            remoteStream,
            callType,
            isAudioEnabled,
            isVideoEnabled,
            remoteUser
        }}>
            {children}
        </CallContext.Provider>
    );
};
