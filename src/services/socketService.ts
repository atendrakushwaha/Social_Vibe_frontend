import { io, Socket } from 'socket.io-client';
import { SOCKET_URL, SOCKET_EVENTS } from '../constants';
import { tokenUtils } from '../utils';

class SocketService {
    private socket: Socket | null = null;
    private isConnected: boolean = false;

    connect(): void {
        if (this.socket && this.isConnected) return;

        const token = tokenUtils.get();
        if (!token) {
            console.warn('No auth token found, skipping socket connection');
            return;
        }

        console.log(`Initializing socket with token: ${token.substring(0, 10)}...`);

        this.socket = io(`${SOCKET_URL}/chat`, {
            auth: {
                token,
            },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        this.socket.on(SOCKET_EVENTS.CONNECT, () => {
            console.log('✅ Socket connected');
            this.isConnected = true;
        });

        this.socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
            console.log('❌ Socket disconnected:', reason);
            this.isConnected = false;
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message);
            this.isConnected = false;
        });

        // Listen for auth errors from server
        this.socket.on('auth_error', (error) => {
            console.error('Socket authentication failed:', error.message);
            this.disconnect();
            tokenUtils.remove();
            // Optional: Force reload to clear state if critical
            // window.location.reload();
        });
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            console.log('Socket manually disconnected');
        }
    }

    // Message Events
    onNewMessage(callback: (data: { message: any; conversationId: string }) => void): void {
        this.socket?.on(SOCKET_EVENTS.MESSAGE_NEW, callback);
    }

    sendMessage(data: { conversationId: string; type: string; content?: string }, callback?: (response: any) => void): void {
        // Backend listens to MESSAGE_SEND for incoming messages from client
        this.socket?.emit(SOCKET_EVENTS.MESSAGE_SEND, data, callback);
    }

    onTyping(callback: (data: { conversationId: string; userId: string; username: string; isTyping: boolean }) => void): void {
        this.socket?.on(SOCKET_EVENTS.TYPING_UPDATE, callback);
    }

    // Removed emitStopTyping/onStopTyping redundant wrappers if we use generic update or split events
    // Backend listens to typing:start and typing:stop

    emitTypingStart(conversationId: string, username: string): void {
        this.socket?.emit(SOCKET_EVENTS.TYPING_START, { conversationId, username });
    }

    emitTypingStop(conversationId: string): void {
        this.socket?.emit(SOCKET_EVENTS.TYPING_STOP, { conversationId });
    }

    // Notification Events
    onNewNotification(callback: (notification: any) => void): void {
        this.socket?.on(SOCKET_EVENTS.NEW_NOTIFICATION, callback);
    }

    onPostLiked(callback: (data: { postId: string; userId: string }) => void): void {
        this.socket?.on(SOCKET_EVENTS.POST_LIKED, callback);
    }

    onPostCommented(callback: (data: { postId: string; userId: string; comment: any }) => void): void {
        this.socket?.on(SOCKET_EVENTS.POST_COMMENTED, callback);
    }

    onNewFollower(callback: (data: { userId: string }) => void): void {
        this.socket?.on(SOCKET_EVENTS.NEW_FOLLOWER, callback);
    }

    // Online Status
    onOnlineStatus(callback: (data: { userId: string; online: boolean }) => void): void {
        this.socket?.on(SOCKET_EVENTS.ONLINE_STATUS, callback);
    }

    // Join/Leave rooms
    joinConversation(conversationId: string): void {
        this.socket?.emit(SOCKET_EVENTS.CONVERSATION_JOIN, { conversationId });
    }

    leaveConversation(conversationId: string): void {
        this.socket?.emit(SOCKET_EVENTS.CONVERSATION_LEAVE, { conversationId });
    }

    // Generic event listener
    on(event: string, callback: Function): void {
        this.socket?.on(event, callback as any);
    }

    // Generic event emitter
    emit(event: string, data?: any, callback?: Function): void {
        this.socket?.emit(event, data, callback);
    }

    // Remove event listener
    off(event: string, callback?: Function): void {
        if (callback) {
            this.socket?.off(event, callback as any);
        } else {
            this.socket?.off(event);
        }
    }

    // ==================== CALL SIGNALING ====================
    // Initiate outgoing call
    initiateCall(data: { to: string; callType: 'video' | 'audio'; signal: any }, callback?: (res: any) => void): void {
        this.socket?.emit('call:initiate', data, callback);
    }

    // Answer incoming call
    answerCall(data: { callId: string; signal: any }, callback?: (res: any) => void): void {
        this.socket?.emit('call:answer', data, callback);
    }

    // Reject incoming call
    rejectCall(data: { callId: string }, callback?: (res: any) => void): void {
        this.socket?.emit('call:reject', data, callback);
    }

    // End active call
    endCall(data: { callId: string }, callback?: (res: any) => void): void {
        this.socket?.emit('call:end', data, callback);
    }

    // Send ICE candidate
    sendIceCandidate(data: { callId: string; candidate: any; to: string }): void {
        this.socket?.emit('call:ice-candidate', data);
    }

    // Toggle media (mute/video off)
    toggleMedia(data: { callId: string; to: string; mediaType: 'video' | 'audio'; enabled: boolean }): void {
        this.socket?.emit('call:toggle-media', data);
    }

    // Listeners
    onIncomingCall(callback: (data: any) => void): void {
        this.socket?.on('call:incoming', callback);
    }

    onCallAnswered(callback: (data: any) => void): void {
        this.socket?.on('call:answered', callback);
    }

    onCallRejected(callback: (data: any) => void): void {
        this.socket?.on('call:rejected', callback);
    }

    onCallEnded(callback: (data: any) => void): void {
        this.socket?.on('call:ended', callback);
    }

    onIceCandidate(callback: (data: any) => void): void {
        this.socket?.on('call:ice-candidate', callback);
    }

    onMediaToggled(callback: (data: any) => void): void {
        this.socket?.on('call:media-toggled', callback);
    }

    // Get connection status
    isSocketConnected(): boolean {
        return this.isConnected && this.socket?.connected === true;
    }

    // Get socket instance
    getSocket(): Socket | null {
        return this.socket;
    }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
