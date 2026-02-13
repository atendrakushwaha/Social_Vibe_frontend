import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import socketService from '../services/socketService';
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

const peerConfiguration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ],
};

export const CallProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // State
    const [callState, setCallState] = useState<CallState>('IDLE');
    const [callType, setCallType] = useState<'video' | 'audio'>('video');
    const [remoteUser, setRemoteUser] = useState<{ id: string; username: string; avatar?: string } | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);

    // Refs (Stable across renders)
    const callStateRef = useRef<CallState>('IDLE');
    const callIdRef = useRef<string | null>(null);
    const remoteUserRef = useRef<{ id: string } | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const pendingOfferRef = useRef<any>(null);
    const pendingCandidatesRef = useRef<RTCIceCandidate[]>([]); // Remote candidates arriving before RemoteDesc
    const localCandidatesQueueRef = useRef<RTCIceCandidate[]>([]); // Local candidates generated before CallID

    // Sync Ref with State for UI
    const updateCallState = (newState: CallState) => {
        setCallState(newState);
        callStateRef.current = newState;
    };

    const cleanupCall = useCallback(() => {
        updateCallState('IDLE');
        callIdRef.current = null;
        remoteUserRef.current = null;
        pendingOfferRef.current = null;
        pendingCandidatesRef.current = [];
        localCandidatesQueueRef.current = [];

        setRemoteUser(null);
        setLocalStream(null);
        setRemoteStream(null);

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                track.stop();
                console.log('Stopped track:', track.kind);
            });
            localStreamRef.current = null;
        }

        if (peerConnectionRef.current) {
            peerConnectionRef.current.ontrack = null;
            peerConnectionRef.current.onicecandidate = null;
            peerConnectionRef.current.onconnectionstatechange = null;
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
    }, []);

    const endCall = useCallback(() => {
        if (callIdRef.current) {
            socketService.endCall({ callId: callIdRef.current });
        }
        cleanupCall();
    }, [cleanupCall]);

    const createPeerConnection = useCallback(() => {
        if (peerConnectionRef.current) return peerConnectionRef.current;

        console.log('Creating RTCPeerConnection');
        const pc = new RTCPeerConnection(peerConfiguration);

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                if (callIdRef.current && remoteUserRef.current) {
                    console.log('Sending ICE candidate', event.candidate);
                    socketService.sendIceCandidate({
                        callId: callIdRef.current,
                        candidate: event.candidate,
                        to: remoteUserRef.current.id
                    });
                } else {
                    console.log('Queueing local ICE candidate (No CallID yet)');
                    localCandidatesQueueRef.current.push(event.candidate);
                }
            }
        };

        pc.ontrack = (event) => {
            console.log('Track received:', event.streams[0]);
            setRemoteStream(event.streams[0]);
        };

        pc.onconnectionstatechange = () => {
            console.log('PC Connection State:', pc.connectionState);
            if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
                cleanupCall();
            }
        };

        peerConnectionRef.current = pc;
        return pc;
    }, [cleanupCall]);

    const getMedia = useCallback(async (type: 'video' | 'audio') => {
        try {
            console.log('Requesting media:', type);
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: type === 'video'
            });
            setLocalStream(stream);
            localStreamRef.current = stream;

            // Add tracks to PC
            const pc = peerConnectionRef.current;
            if (pc) {
                stream.getTracks().forEach(track => {
                    pc.addTrack(track, stream);
                });
            }
            return stream;
        } catch (error) {
            console.error('Media Access Error:', error);
            toast.error('Could not access camera/microphone');
            cleanupCall();
            return null;
        }
    }, [cleanupCall]);

    // Socket Event Listeners (One time setup)
    useEffect(() => {
        const handleIncomingCall = (data: any) => {
            console.log('Incoming call:', data);
            if (callStateRef.current !== 'IDLE') {
                console.warn('Busy, rejecting call:', data.callId);
                socketService.rejectCall({ callId: data.callId });
                return;
            }

            // Set Data
            callIdRef.current = data.callId;
            remoteUserRef.current = { id: data.from };
            pendingOfferRef.current = data.signal;

            // Set UI
            setRemoteUser({ id: data.from, username: data.callerName || 'Caller' });
            setCallType(data.callType);
            updateCallState('INCOMING');
        };

        const handleCallAnswered = async (data: any) => {
            console.log('Call Answered:', data);
            if (callStateRef.current === 'OUTGOING') {
                updateCallState('ACTIVE');
                // Remote answered
                const pc = peerConnectionRef.current;
                if (pc) {
                    try {
                        await pc.setRemoteDescription(new RTCSessionDescription(data.signal));

                        // Flush pending remote candidates
                        if (pendingCandidatesRef.current.length > 0) {
                            console.log(`Flushing ${pendingCandidatesRef.current.length} queued remote candidates`);
                            for (const candidate of pendingCandidatesRef.current) {
                                await pc.addIceCandidate(candidate);
                            }
                            pendingCandidatesRef.current = [];
                        }
                    } catch (e) {
                        console.error('Error setting remote description (answer):', e);
                    }
                }
            }
        };

        const handleCallRejected = () => {
            console.log('Call Rejected');
            toast.error('Call rejected');
            cleanupCall();
        };

        const handleCallEnded = () => {
            console.log('Call Ended by remote');
            toast('Call ended');
            cleanupCall();
        };

        const handleIceCandidate = async (data: any) => {
            if (!data.candidate) return;
            const pc = peerConnectionRef.current;

            if (pc && pc.remoteDescription) {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
                } catch (e) {
                    console.error('Error adding ICE candidate:', e);
                }
            } else {
                console.log('Queueing remote ICE candidate (No PC or RemoteDesc)');
                pendingCandidatesRef.current.push(new RTCIceCandidate(data.candidate));
            }
        };

        socketService.onIncomingCall(handleIncomingCall);
        socketService.onCallAnswered(handleCallAnswered);
        socketService.onCallRejected(handleCallRejected);
        socketService.onCallEnded(handleCallEnded);
        socketService.onIceCandidate(handleIceCandidate);

        return () => {
            socketService.off('call:incoming', handleIncomingCall);
            socketService.off('call:answered', handleCallAnswered);
            socketService.off('call:rejected', handleCallRejected);
            socketService.off('call:ended', handleCallEnded);
            socketService.off('call:ice-candidate', handleIceCandidate);
        };
    }, [cleanupCall]); // cleanupCall is stable via useCallback

    // Actions
    const makeCall = async (userId: string, type: 'video' | 'audio', username?: string, avatar?: string) => {
        if (callStateRef.current !== 'IDLE') return;

        setRemoteUser({ id: userId, username: username || 'User', avatar });
        remoteUserRef.current = { id: userId };
        setCallType(type);
        updateCallState('OUTGOING');

        const pc = createPeerConnection();
        const stream = await getMedia(type);
        if (!stream) return; // Error handled in getMedia

        try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            socketService.initiateCall({
                to: userId,
                callType: type,
                signal: offer
            }, (response: any) => {
                if (response?.success) {
                    console.log('Call initiated, ID:', response.callId);
                    callIdRef.current = response.callId;

                    // Flush local candidates queued before CallID was available
                    if (localCandidatesQueueRef.current.length > 0) {
                        console.log(`Flushing ${localCandidatesQueueRef.current.length} queued local candidates`);
                        localCandidatesQueueRef.current.forEach(candidate => {
                            socketService.sendIceCandidate({
                                callId: response.callId,
                                candidate: candidate,
                                to: userId
                            });
                        });
                        localCandidatesQueueRef.current = [];
                    }
                } else {
                    toast.error('Failed to connect');
                    endCall();
                }
            });
        } catch (e) {
            console.error('Error creating offer:', e);
            endCall();
        }
    };

    const answerCall = async () => {
        if (callStateRef.current !== 'INCOMING' || !callIdRef.current || !remoteUserRef.current) return;

        const pc = createPeerConnection();
        const stream = await getMedia(callType);
        if (!stream) return;

        try {
            // Set Remote Description (Offer) first
            if (pendingOfferRef.current) {
                await pc.setRemoteDescription(new RTCSessionDescription(pendingOfferRef.current));

                // Flush pending remote candidates
                if (pendingCandidatesRef.current.length > 0) {
                    for (const candidate of pendingCandidatesRef.current) {
                        await pc.addIceCandidate(candidate);
                    }
                    pendingCandidatesRef.current = [];
                }
            }

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            updateCallState('ACTIVE');

            socketService.answerCall({
                callId: callIdRef.current,
                signal: answer
            });
        } catch (e) {
            console.error('Error answering call:', e);
            endCall();
        }
    };

    const rejectCall = useCallback(() => {
        if (callIdRef.current) {
            socketService.rejectCall({ callId: callIdRef.current });
        }
        cleanupCall();
    }, [cleanupCall]);

    const toggleVideo = () => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoEnabled(videoTrack.enabled);
                if (callIdRef.current && remoteUserRef.current) {
                    socketService.toggleMedia({
                        callId: callIdRef.current,
                        to: remoteUserRef.current.id,
                        mediaType: 'video',
                        enabled: videoTrack.enabled
                    });
                }
            }
        }
    };

    const toggleAudio = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioEnabled(audioTrack.enabled);
                // Send mute signal if needed
            }
        }
    };

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
