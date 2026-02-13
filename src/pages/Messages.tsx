import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { messageService } from '../services/messageService';
import { userService } from '../services/userService'; // Import userService
import { useAppSelector, useAppDispatch } from '../store/hooks'; // Added useAppDispatch
import type { Conversation, Message, User } from '../types'; // Import User type
import { Avatar } from '../components/common/Avatar';
import { Loading } from '../components/common/Loading';
import { useCall } from '../context/CallContext';
import { Button } from '../components/common/Button';
import { format, isSameDay, isToday, isYesterday } from 'date-fns';
import socketService from '../services/socketService';
import { SOCKET_EVENTS } from '../constants';
import toast from 'react-hot-toast';

const Messages: React.FC = () => {
    const { conversationId } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const currentUser = useAppSelector(state => state.auth.user);
    const { makeCall } = useCall();

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');

    // Search states
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Helper for robust ID comparison
    const getUserId = (user: any) => {
        if (!user) return '';
        if (typeof user === 'string') return user;
        if (typeof user === 'object') {
            if (user._id) return String(user._id);
            if (user.id) return String(user.id);
            return String(user);
        }
        return String(user);
    };

    // Typing states
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Fetch conversations on mount
    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        if (!currentUser) return;
        try {
            const response = await messageService.getConversations();
            // Handle both PaginatedResponse and array
            const data = Array.isArray(response) ? response : (response?.data || []);
            // Map unread counts from backend Map/Object to flat property
            const processedData = data.map((c: any) => ({
                ...c,
                unreadCount: c.unreadCounts?.[getUserId(currentUser)] || 0
            }));
            setConversations(processedData);
        } catch (error) {
            console.error('Failed to fetch conversations', error);
            setConversations([]);
        }
    };

    // Refetch when currentUser is available to ensure correct unread counts
    useEffect(() => {
        if (currentUser) {
            fetchConversations();
        }
    }, [currentUser]);

    // Handle User Search
    useEffect(() => {
        const searchUsers = async () => {
            if (!searchQuery.trim()) {
                setSearchResults([]);
                return;
            }
            try {
                const response = await userService.searchUsers(searchQuery);
                const results = response.data || [];
                // Filter out current user to prevent self-messaging
                setSearchResults(results.filter(u => u._id !== currentUser?._id));
            } catch (error) {
                console.error('Search failed', error);
            }
        };

        const timeoutId = setTimeout(searchUsers, 300); // Debounce
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    // Create or Open Conversation
    const handleUserSelect = async (userId: string) => {
        try {
            // Check if we already have a conversation with this user locally
            const existingConv = conversations.find(c =>
                c.participants.some(p => p._id === userId && p._id !== currentUser?._id)
            );

            if (existingConv) {
                navigate(`/messages/${existingConv._id}`);
                setIsSearching(false);
                setSearchQuery('');
                return;
            }

            // Create new conversation on backend
            const newConv = await messageService.createConversation(userId);
            setConversations(prev => [newConv, ...prev]);
            navigate(`/messages/${newConv._id}`);
            setIsSearching(false);
            setSearchQuery('');
        } catch (error) {
            console.error('Failed to create conversation', error);
            toast.error('Failed to start conversation');
        }
    };



    // Fetch messages when conversation changes
    useEffect(() => {
        if (!conversationId) return;

        const fetchMessages = async () => {
            try {
                const response = await messageService.getMessages(conversationId);
                const data = Array.isArray(response) ? response : (response?.data || []);
                setMessages(data || []);
                setTimeout(scrollToBottom, 100);
            } catch (error) {
                console.error('Failed to fetch messages', error);
                setMessages([]);
            }
        };
        fetchMessages();

        // Ensure socket is connected
        if (!socketService.getSocket()) {
            socketService.connect();
        }
        socketService.joinConversation(conversationId);

        // Re-join on reconnect
        const handleConnect = () => {
            console.log('Socket reconnected, joining conversation:', conversationId);
            socketService.joinConversation(conversationId);
        };
        socketService.on('connect', handleConnect);

        return () => {
            socketService.leaveConversation(conversationId);
            socketService.off('connect', handleConnect);
        };
    }, [conversationId]);

    // Listen for incoming messages
    useEffect(() => {
        const handleNewMessage = (data: any) => {
            if (data.conversationId === conversationId) {
                setMessages(prev => {
                    const realMessage = data.message;
                    const realSenderId = getUserId(realMessage.senderId);
                    const currentUserId = getUserId(currentUser);

                    // Deduplication check
                    if (prev.some(m => m._id === realMessage._id)) return prev;

                    // If message is from me, remove any pending optimistic messages
                    if (realSenderId === currentUserId) {
                        const filtered = prev.filter(m => !m._id.startsWith('optimistic_'));
                        return [...filtered, realMessage];
                    }

                    return [...prev, realMessage];
                });
                setTimeout(scrollToBottom, 100);
            }
            // Update conversation list logic omitted/kept same if outside scope, but here it's inside
            // I need to preserve the rest of the logic or user loses it?
            // The tool replaces lines 101-171. I must include everything.

            // Re-implement conversation update logic
            setConversations(prev => prev.map(c => {
                if (c._id === data.conversationId) {
                    return {
                        ...c,
                        lastMessage: data.message,
                        updatedAt: new Date().toISOString(),
                        unreadCount: data.conversationId === conversationId ? 0 : ((c.unreadCount || 0) + 1)
                    };
                }
                return c;
            }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
        };

        if (!socketService.getSocket()) {
            socketService.connect();
        }
        socketService.onNewMessage(handleNewMessage);

        return () => {
            socketService.off(SOCKET_EVENTS.MESSAGE_NEW, handleNewMessage);
        };
    }, [conversationId, currentUser]);

    // Mark messages as read and listen for read updates
    useEffect(() => {
        if (!conversationId || !currentUser || !messages.length) return;

        // Helper to get ID safely
        const getUserId = (id: any) => (id && typeof id === 'object' ? id._id : id);

        // Mark unread messages from others as read
        const unreadIds = messages
            .filter(m => {
                const senderId = getUserId(m.senderId);
                const isFromOthers = senderId !== currentUser._id;
                const isUnreadByMe = !m.readBy || !m.readBy.some((r: any) => getUserId(r.userId) === currentUser._id);
                return isFromOthers && isUnreadByMe;
            })
            .map(m => m._id);

        if (unreadIds.length > 0) {
            socketService.emit('message:read', { conversationId, messageIds: unreadIds });
            // Optimistically update local state
            setMessages(prev => prev.map(m => {
                if (unreadIds.includes(m._id)) {
                    return {
                        ...m,
                        readBy: [...(m.readBy || []), { userId: currentUser._id, readAt: new Date().toISOString() }]
                    };
                }
                return m;
            }));
        }

        const handleReadUpdate = (data: any) => {
            if (data.conversationId === conversationId) {
                setMessages(prev => prev.map(m => {
                    if (data.messageIds.includes(m._id)) {
                        // Check if already marked
                        if (m.readBy?.some((r: any) => getUserId(r.userId) === data.readBy)) return m;

                        return {
                            ...m,
                            readBy: [...(m.readBy || []), { userId: data.readBy, readAt: new Date(data.readAt).toISOString() }]
                        };
                    }
                    return m;
                }));
            }
        };

        socketService.on('message:read:update', handleReadUpdate);

        return () => {
            socketService.off('message:read:update', handleReadUpdate);
        };
    }, [conversationId, messages.length, currentUser?._id]); // Depend on messages.length to check new messages

    // Listen for typing events
    useEffect(() => {
        const handleTypingUpdate = (data: { conversationId: string; userId: string; username: string; isTyping: boolean }) => {
            if (data.conversationId === conversationId && data.userId !== currentUser?._id) {
                setTypingUsers(prev => {
                    const newSet = new Set(prev);
                    if (data.isTyping) {
                        newSet.add(data.username);
                    } else {
                        newSet.delete(data.username);
                    }
                    return newSet;
                });
            }
        };

        socketService.onTyping(handleTypingUpdate);

        return () => {
            socketService.off(SOCKET_EVENTS.TYPING_UPDATE, handleTypingUpdate);
        };
    }, [conversationId, currentUser?._id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);

        if (!conversationId || !currentUser) return;

        if (!isTyping) {
            setIsTyping(true);
            socketService.emitTypingStart(conversationId, currentUser.username);
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            socketService.emitTypingStop(conversationId);
        }, 2000);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !conversationId || !currentUser) return;

        const tempContent = newMessage;
        const tempId = `optimistic_${Date.now()}`;

        // Optimistic message
        const optimisticMessage: any = {
            _id: tempId,
            conversationId,
            senderId: currentUser._id, // Use string ID for immediate correct alignment
            type: 'text',
            content: tempContent,
            createdAt: new Date().toISOString(),
            isViewOnce: false,
            updatedAt: new Date().toISOString(),
            reactions: new Map() // Or array depending on type, but Map is safer default if schema uses it
        };

        setMessages(prev => [...prev, optimisticMessage]);
        setNewMessage('');
        setTimeout(scrollToBottom, 10);

        try {
            // Check socket connection for instant sending
            if (socketService.isSocketConnected()) {
                socketService.sendMessage({
                    conversationId,
                    type: 'text',
                    content: tempContent
                }, (response: any) => {
                    // Socket acknowledgment callback
                    const savedMessage = response?.message || response;

                    if (savedMessage) {
                        setMessages(prev => {
                            if (prev.some(m => m._id === savedMessage._id)) {
                                return prev.filter(m => m._id !== tempId);
                            }
                            return prev.map(m => m._id === tempId ? savedMessage : m);
                        });
                    } else {
                        // If socket fails (no ack), fallback logic or error
                        // Here we assume failure if no ack. Ideally we retry via HTTP.
                        console.warn('Socket message ack missing or invalid', response);
                        // fallbackToHttp(conversationId, tempContent, tempId); // Wait, if ack received but empty?
                        // If response.success is false?
                        if (response?.error) {
                            console.error('Socket send error:', response.error);
                            toast.error(response.error);
                            setMessages(prev => prev.filter(m => m._id !== tempId));
                        }
                    }
                });
            } else {
                // HTTP Fallback
                await fallbackToHttp(conversationId, tempContent, tempId);
            }
        } catch (error) {
            console.error('Failed to send message', error);
            // Try HTTP fallback in catch?
            // Already handled in fallbackToHttp call if socket check false.
            // If socket throws?
            await fallbackToHttp(conversationId, tempContent, tempId);
        }
    };

    const fallbackToHttp = async (convId: string, content: string, tempId: string) => {
        try {
            const savedMessage = await messageService.sendMessage({
                conversationId: convId,
                type: 'text',
                content: content
            });

            setMessages(prev => {
                if (prev.some(m => m._id === savedMessage._id)) {
                    return prev.filter(m => m._id !== tempId);
                }
                return prev.map(m => m._id === tempId ? savedMessage : m);
            });
        } catch (error) {
            console.error('Failed to send message via HTTP', error);
            toast.error('Failed to send message');
            setMessages(prev => prev.filter(m => m._id !== tempId));
        }
    };

    const getOtherParticipant = (conversation: Conversation) => {
        if (!conversation?.participants || conversation.participants.length === 0) {
            return null;
        }
        return conversation.participants.find(p => p._id !== currentUser?._id) || conversation.participants[0];
    };

    if (!currentUser) {
        return (
            <div className="flex h-[calc(100vh-6rem)] items-center justify-center bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-6rem)] bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border overflow-hidden">
            {/* Conversations List */}
            <div className={`w-full md:w-80 border-r border-gray-200 dark:border-dark-border flex flex-col ${conversationId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-gray-200 dark:border-dark-border flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                        <h2 className="font-bold text-lg text-gray-900 dark:text-white">Messages</h2>
                        <Button variant="ghost" size="sm" onClick={() => setIsSearching(!isSearching)}>
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isSearching ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                )}
                            </svg>
                        </Button>
                    </div>
                    {isSearching && (
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="w-full bg-gray-100 dark:bg-dark-bg border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                    )}
                </div>

                <div className="flex-1 overflow-y-auto">
                    {isSearching ? (
                        // Search Results
                        <div className="p-2">
                            {searchResults.map(user => (
                                <div
                                    key={user._id}
                                    onClick={() => handleUserSelect(user._id)}
                                    className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-dark-bg cursor-pointer rounded-lg mb-1"
                                >
                                    <Avatar src={user.avatar} alt={user.username} size="sm" />
                                    <div className="ml-3">
                                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{user.username}</p>
                                        <p className="text-xs text-gray-500">{user.fullName}</p>
                                    </div>
                                </div>
                            ))}
                            {searchQuery && searchResults.length === 0 && (
                                <p className="text-center text-gray-500 text-sm mt-4">No user found</p>
                            )}
                        </div>
                    ) : (
                        // Conversations List
                        conversations && conversations.length > 0 ? conversations.map(conv => {
                            const otherUser = getOtherParticipant(conv);
                            if (!otherUser) return null;
                            const isActive = conversationId === conv._id;

                            return (
                                <div
                                    key={conv._id}
                                    onClick={() => navigate(`/messages/${conv._id}`)}
                                    className={`flex items-center p-4 hover:bg-gray-50 dark:hover:bg-dark-bg cursor-pointer transition-colors ${isActive ? 'bg-gray-50 dark:bg-dark-bg border-r-4 border-primary-500' : ''}`}
                                >
                                    <Avatar src={otherUser.avatar} alt={otherUser.username} size="md" />
                                    <div className="ml-3 flex-1 overflow-hidden">
                                        <h3 className={`font-semibold text-gray-900 dark:text-white truncate ${isActive ? 'text-primary-600 dark:text-primary-400' : ''}`}>
                                            {otherUser.username}
                                        </h3>
                                        <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                                            {conv.lastMessage?.content || 'Started a conversation'}
                                        </p>
                                    </div>
                                    {conv.unreadCount > 0 && (
                                        <div className="bg-primary-500 text-white text-[10px] font-bold rounded-full min-w-[1.25rem] h-5 flex items-center justify-center px-1.5 ml-2 shadow-sm">
                                            {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                                        </div>
                                    )}
                                </div>
                            );
                        }) : (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-dark-bg rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <p className="font-medium">No messages yet</p>
                                <p className="text-sm mt-2">Tap the new message icon to start chatting with friends</p>
                                <Button size="sm" variant="primary" className="mt-4" onClick={() => setIsSearching(true)}>
                                    Start Chatting
                                </Button>
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col ${!conversationId ? 'hidden md:flex' : 'flex'}`}>
                {conversationId ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gray-200 dark:border-dark-border flex items-center bg-white dark:bg-dark-card z-10">
                            <button className="md:hidden mr-4" onClick={() => navigate('/messages')}>
                                <svg className="w-6 h-6 text-gray-900 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            {(() => {
                                const currentConv = conversations.find(c => c._id === conversationId);
                                const chatPartner = currentConv ? getOtherParticipant(currentConv) : null;
                                return chatPartner ? (
                                    <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => navigate(`/profile/${chatPartner.username}`)}>
                                        <Avatar src={chatPartner.avatar} alt={chatPartner.username} size="sm" />
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white group-hover:underline">{chatPartner.username}</h3>
                                            {typingUsers.size > 0 ? (
                                                <p className="text-xs text-primary-500 animate-pulse font-medium">
                                                    {Array.from(typingUsers).join(', ')} is typing...
                                                </p>
                                            ) : (
                                                <p className="text-xs text-green-500">Active now</p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">Loading...</h3>
                                    </div>
                                );
                            })()}

                            {/* Call Actions */}
                            {(() => {
                                const currentConv = conversations.find(c => c._id === conversationId);
                                const chatPartner = currentConv ? (currentUser && getUserId(currentConv.participants[0]) === getUserId(currentUser) ? currentConv.participants[1] : currentConv.participants[0]) : null;

                                return chatPartner ? (
                                    <div className="ml-auto flex items-center space-x-4 text-gray-500">
                                        <button
                                            onClick={() => makeCall(getUserId(chatPartner), 'audio', chatPartner.username, chatPartner.avatar)}
                                            className="hover:bg-gray-100 dark:hover:bg-dark-bg p-2 rounded-full transition-colors"
                                            title="Voice Call"
                                        >
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => makeCall(getUserId(chatPartner), 'video', chatPartner.username, chatPartner.avatar)}
                                            className="hover:bg-gray-100 dark:hover:bg-dark-bg p-2 rounded-full transition-colors"
                                            title="Video Call"
                                        >
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </button>
                                    </div>
                                ) : null;
                            })()}
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50 dark:bg-black/20 pb-4 no-scrollbar">
                            {messages && messages.length > 0 ? messages.map((msg, index) => {
                                const currentUserId = getUserId(currentUser);
                                const isMe = getUserId(msg.senderId) === currentUserId;
                                const isSystem = !msg.senderId;
                                const isOptimistic = typeof msg._id === 'string' && msg._id.startsWith('optimistic_');
                                const sender = typeof msg.senderId === 'object' ? msg.senderId : null;

                                // Date Header Logic
                                const prevMsg = messages[index - 1];
                                const isNewDay = !prevMsg || !isSameDay(new Date(msg.createdAt), new Date(prevMsg.createdAt));

                                return (
                                    <React.Fragment key={msg._id || index}>
                                        {isNewDay && (
                                            <div className="flex justify-center my-6">
                                                <span className="text-[11px] font-medium text-gray-500 bg-gray-100 dark:bg-dark-card/60 px-3 py-1 rounded-full shadow-sm backdrop-blur-sm border border-gray-100 dark:border-dark-border/50">
                                                    {isToday(new Date(msg.createdAt))
                                                        ? 'Today'
                                                        : isYesterday(new Date(msg.createdAt))
                                                            ? 'Yesterday'
                                                            : format(new Date(msg.createdAt), 'MMMM d, yyyy')}
                                                </span>
                                            </div>
                                        )}

                                        {isSystem ? (
                                            <div className="flex justify-center my-4">
                                                <span className="text-xs text-center text-gray-500 bg-gray-100 dark:bg-dark-card px-3 py-1 rounded-full shadow-sm">
                                                    {msg.content}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className={`flex w-full mb-1 ${isMe ? 'justify-end' : 'justify-start items-end gap-2'}`}>
                                                {!isMe && (
                                                    <div className="mb-1 flex-shrink-0 cursor-pointer" onClick={() => sender && navigate(`/profile/${sender.username}`)}>
                                                        <Avatar src={sender?.avatar} alt={sender?.username || 'User'} size="xs" />
                                                    </div>
                                                )}
                                                <div className={`
                                                    relative px-3 py-2 shadow-sm max-w-[75%] md:max-w-[65%] text-[15px]
                                                    ${isMe
                                                        ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl rounded-tr-sm'
                                                        : 'bg-white dark:bg-dark-card text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-dark-border rounded-2xl rounded-tl-sm'}
                                                `}>
                                                    <p className="leading-relaxed break-words whitespace-pre-wrap font-normal">{msg.content}</p>
                                                    <div className={`flex items-center gap-1 mt-0.5 ${isMe ? 'justify-end text-primary-100/90' : 'justify-start text-gray-400'}`}>
                                                        <span className="text-[10px] font-medium opacity-90">
                                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        {isMe && (
                                                            <span className="ml-0.5 flex items-center">
                                                                {isOptimistic ? (
                                                                    <svg className="w-3 h-3 animate-spin ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                                    </svg>
                                                                ) : (
                                                                    (() => {
                                                                        const hasRead = msg.readBy && msg.readBy.some((r: any) => {
                                                                            const rId = getUserId(r.userId || r);
                                                                            return rId !== currentUserId;
                                                                        });
                                                                        return hasRead ? (
                                                                            <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7M10 13l-4 4m6-10l4 4" />
                                                                            </svg>
                                                                        ) : (
                                                                            <svg className="w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                            </svg>
                                                                        );
                                                                    })()
                                                                )}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </React.Fragment>
                                );
                            }) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                                    <Avatar
                                        src={conversations.find(c => c._id === conversationId)?.participants.find(p => p._id !== currentUser?._id)?.avatar}
                                        size="xl"
                                        className="mb-4 opacity-50 grayscale"
                                    />
                                    <p>No messages yet.</p>
                                    <p className="text-sm">Say hello! 👋</p>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card">
                            <div className="flex items-center gap-2">
                                <button type="button" className="p-2 text-gray-500 hover:text-primary-500 transition-colors">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </button>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={handleInputChange}
                                    placeholder="Message..."
                                    className="flex-1 bg-gray-100 dark:bg-dark-bg border-none rounded-full px-4 py-2.5 focus:ring-2 focus:ring-primary-500 transition-shadow"
                                />
                                <Button type="submit" disabled={!newMessage.trim()} variant="primary" className="rounded-full px-6">
                                    Send
                                </Button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                        <div className="w-24 h-24 bg-gray-100 dark:bg-dark-bg rounded-full flex items-center justify-center mb-6">
                            <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your Messages</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-xs text-center">
                            Send private photos and messages to a friend or group.
                        </p>
                        <Button
                            variant="primary"
                            size="lg"
                            className="shadow-lg shadow-primary-500/30"
                            onClick={() => setIsSearching(true)}
                        >
                            Send Message
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;
