
import React, { useEffect, useRef } from 'react';
import { useCall } from '../../context/CallContext';
import { Avatar } from '../common/Avatar';
import { Phone, Video, Mic, MicOff, VideoOff, PhoneOff, X } from 'lucide-react';

const VideoStream = ({ stream, isLocal, isMirror = false }: { stream: MediaStream | null, isLocal?: boolean, isMirror?: boolean }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
            // Play returns a promise, catch potential errors (e.g., autoplay policy)
            videoRef.current.play().catch(e => console.error("Video play error:", e));
        }
    }, [stream]);

    if (!stream) {
        return <div className="w-full h-full bg-black/90 flex items-center justify-center text-white/50 text-sm">No Stream</div>;
    }

    return (
        <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isLocal} // Local video must be muted to prevent feedback loop
            className={`w-full h-full object-cover ${isMirror ? 'scale-x-[-1]' : ''}`}
        />
    );
};

export const CallManager: React.FC = () => {
    const {
        callState,
        callType,
        remoteUser,
        localStream,
        remoteStream,
        answerCall,
        rejectCall,
        endCall,
        toggleAudio,
        toggleVideo,
        isAudioEnabled,
        isVideoEnabled
    } = useCall();

    if (callState === 'IDLE') return null;

    // --- Components for States ---

    // 1. INCOMING CALL
    if (callState === 'INCOMING') {
        return (
            <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary-500/20 rounded-full animate-ping" />
                        <Avatar src={remoteUser?.avatar} alt={remoteUser?.username} size="xl" className="w-32 h-32 ring-4 ring-primary-500/50" />
                    </div>
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-white mb-2">{remoteUser?.username}</h2>
                        <p className="text-gray-400 text-lg">Incoming {callType} call...</p>
                    </div>
                </div>

                <div className="w-full max-w-md pb-16 px-8 flex justify-between items-center space-x-8">
                    <button
                        onClick={rejectCall}
                        className="flex flex-col items-center space-y-2 group"
                    >
                        <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-500/30 transition-transform group-hover:scale-110">
                            <X className="w-8 h-8" />
                        </div>
                        <span className="text-gray-400 text-sm">Decline</span>
                    </button>

                    <button
                        onClick={answerCall}
                        className="flex flex-col items-center space-y-2 group"
                    >
                        <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-500/30 animate-pulse transition-transform group-hover:scale-110">
                            <Phone className="w-8 h-8 fill-current" />
                        </div>
                        <span className="text-gray-400 text-sm">Accept</span>
                    </button>
                </div>
            </div>
        );
    }

    // 2. OUTGOING CALL
    if (callState === 'OUTGOING') {
        return (
            <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col">
                {/* Background: Local Video if available (for Video calls) */}
                {callType === 'video' && localStream && (
                    <div className="absolute inset-0 opacity-30 blur-sm">
                        <VideoStream stream={localStream} isLocal isMirror />
                    </div>
                )}

                <div className="flex-1 flex flex-col items-center justify-center z-10 space-y-8 mt-20">
                    <div className="relative">
                        {/* Ripple Effect */}
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`absolute inset-0 bg-white/10 rounded-full animate-ping`} style={{ animationDelay: `${i * 0.5}s`, animationDuration: '3s' }} />
                        ))}
                        <Avatar src={remoteUser?.avatar} alt={remoteUser?.username} size="xl" className="w-32 h-32 relative z-10 ring-4 ring-white/10" />
                    </div>
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-white mb-2">{remoteUser?.username}</h2>
                        <p className="text-gray-400 text-lg animate-pulse">Calling...</p>
                    </div>
                </div>

                <div className="pb-16 flex justify-center z-10">
                    <button
                        onClick={endCall}
                        className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-500/30 hover:bg-red-600 transition-all transform hover:scale-110"
                    >
                        <PhoneOff className="w-8 h-8" />
                    </button>
                </div>
            </div>
        );
    }

    // 3. ACTIVE CALL
    if (callState === 'ACTIVE') {
        return (
            <div className="fixed inset-0 z-[100] bg-black overflow-hidden touch-none">
                {/* Remote Stream (Full Screen) */}
                <div className="absolute inset-0 w-full h-full">
                    {remoteStream ? (
                        <VideoStream stream={remoteStream} />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900">
                            <Avatar src={remoteUser?.avatar} size="xl" className="w-32 h-32 opacity-50" />
                            <p className="text-gray-500 mt-4">Waiting for video...</p>
                        </div>
                    )}
                </div>

                {/* Local Stream (PiP) */}
                <div className="absolute top-4 right-4 w-32 h-48 bg-gray-800 rounded-xl overflow-hidden shadow-2xl border border-white/20 transition-all hover:scale-105 active:scale-95 cursor-move z-20">
                    {localStream ? (
                        <VideoStream stream={localStream} isLocal isMirror />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                            Camera Off
                        </div>
                    )}
                </div>

                {/* Controls Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 to-transparent flex justify-center items-center space-x-6 z-30">
                    <button
                        onClick={toggleAudio}
                        className={`p-4 rounded-full ${isAudioEnabled ? 'bg-white/10 hover:bg-white/20' : 'bg-white text-black'} backdrop-blur-sm transition-all`}
                    >
                        {isAudioEnabled ? <Mic className="w-6 h-6 text-white" /> : <MicOff className="w-6 h-6" />}
                    </button>

                    <button
                        onClick={endCall}
                        className="p-5 rounded-full bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/40 transform hover:scale-110 transition-all"
                    >
                        <PhoneOff className="w-8 h-8 text-white fill-current" />
                    </button>

                    <button
                        onClick={toggleVideo}
                        className={`p-4 rounded-full ${isVideoEnabled ? 'bg-white/10 hover:bg-white/20' : 'bg-white text-black'} backdrop-blur-sm transition-all`}
                    >
                        {isVideoEnabled ? <Video className="w-6 h-6 text-white" /> : <VideoOff className="w-6 h-6" />}
                    </button>
                </div>
            </div>
        );
    }

    return null; // Should not reach here if IDLE
};
