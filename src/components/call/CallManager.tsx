import React from 'react';
import { useCall } from '../../context/CallContext';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';

export const CallManager: React.FC = () => {
    const {
        callState,
        remoteUser,
        callType,
        localStream,
        remoteStream,
        answerCall,
        rejectCall,
        endCall,
        toggleVideo,
        toggleAudio,
        isVideoEnabled,
        isAudioEnabled
    } = useCall();

    if (callState === 'IDLE') return null;

    // Helper for video elements
    const LocalVideo = ({ stream }: { stream: MediaStream | null }) => {
        const videoRef = React.useRef<HTMLVideoElement>(null);
        React.useEffect(() => {
            if (videoRef.current && stream) {
                videoRef.current.srcObject = stream;
                // Ensure proper play even after remount
                videoRef.current.play().catch(e => console.error("Local video play error", e));
            }
        }, [stream]);
        return <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />;
    };

    const RemoteVideo = ({ stream }: { stream: MediaStream | null }) => {
        const videoRef = React.useRef<HTMLVideoElement>(null);
        React.useEffect(() => {
            if (videoRef.current && stream) {
                videoRef.current.srcObject = stream;
                videoRef.current.play().catch(e => console.error("Remote video play error", e));
            }
        }, [stream]);
        return <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />;
    };

    if (callState === 'INCOMING') {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-2xl flex flex-col items-center w-80 animate-bounce-in">
                    <Avatar src={remoteUser?.avatar} alt={remoteUser?.username} size="xl" className="mb-4 animate-pulse ring-4 ring-primary-500/30" />
                    <h3 className="text-xl font-bold dark:text-white mb-1">{remoteUser?.username}</h3>
                    <p className="text-gray-500 mb-6">Incoming {callType} call...</p>
                    <div className="flex gap-4 w-full">
                        <Button variant="ghost" className="flex-1 bg-red-100 text-red-600 hover:bg-red-200" onClick={rejectCall}>
                            Decline
                        </Button>
                        <Button variant="primary" className="flex-1 bg-green-500 hover:bg-green-600 animate-pulse" onClick={answerCall}>
                            Answer
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (callState === 'OUTGOING') {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                {/* Local Preview Background */}
                <div className="absolute inset-0 z-0">
                    {localStream && callType === 'video' ? (
                        <LocalVideo stream={localStream} />
                    ) : (
                        <div className="w-full h-full bg-gray-900" />
                    )}
                    <div className="absolute inset-0 bg-black/60" /> {/* Overlay to darken */}
                </div>

                <div className="relative z-10 bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-2xl flex flex-col items-center w-80 border border-white/20">
                    <div className="relative mb-4">
                        <Avatar src={remoteUser?.avatar} alt={remoteUser?.username} size="xl" />
                        <div className="absolute inset-0 rounded-full border-4 border-primary-500 animate-ping opacity-20"></div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{remoteUser?.username}</h3>
                    <p className="text-gray-300 mb-6">Calling...</p>
                    <Button variant="ghost" className="w-full bg-red-500 text-white hover:bg-red-600 rounded-full" onClick={endCall}>
                        Cancel
                    </Button>
                </div>
            </div>
        );
    }

    if (callState === 'ACTIVE') {
        return (
            <div className="fixed inset-0 z-50 bg-black flex flex-col">
                {/* Remote Video (Main) */}
                <div className="flex-1 relative overflow-hidden">
                    {remoteStream ? (
                        <RemoteVideo stream={remoteStream} />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <Avatar src={remoteUser?.avatar} alt={remoteUser?.username} size="xl" />
                        </div>
                    )}

                    {/* Local Video (PiP) */}
                    <div className="absolute top-4 right-4 w-32 h-48 bg-gray-900 rounded-lg overflow-hidden border-2 border-white/20 shadow-lg">
                        {localStream ? (
                            <LocalVideo stream={localStream} />
                        ) : (
                            <div className="flex items-center justify-center h-full text-white text-xs">Camera Off</div>
                        )}
                    </div>
                </div>

                {/* Controls */}
                <div className="h-24 bg-black/80 backdrop-blur-md flex items-center justify-center gap-6 pb-4">
                    <button
                        onClick={toggleAudio}
                        className={`p-4 rounded-full ${isAudioEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'} text-white transition-colors`}
                    >
                        {isAudioEnabled ? (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                            </svg>
                        )}
                    </button>

                    <button
                        onClick={endCall}
                        className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg transform hover:scale-105 transition-all"
                    >
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
                        </svg>
                    </button>

                    <button
                        onClick={toggleVideo}
                        className={`p-4 rounded-full ${isVideoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'} text-white transition-colors`}
                    >
                        {isVideoEnabled ? (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    return null;
};
