
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { messageService } from '../services/messageService';
import { userService } from '../services/userService';
import { useAppSelector } from '../store/hooks';
import type { Conversation, Message, User } from '../types';
import { Avatar } from '../components/common/Avatar';
import { useCall } from '../context/CallContext';
import { Button } from '../components/common/Button';
import { format, isSameDay } from 'date-fns';
import socketService from '../services/socketService';
import { SOCKET_EVENTS } from '../constants';
import toast from 'react-hot-toast';
import {
    Send,
    Phone,
    Video,
    Info,
    Image as ImageIcon,
    Smile,
    ChevronLeft,
    Search,
    Edit
} from 'lucide-react';

// --- Utility Helper ---
const getUserId = (user: any): string => {
    if (!user) return '';
    if (typeof user === 'string') return user;
    if (typeof user === 'object') {
        if (user._id) return String(user._id);
        if (user.id) return String(user.id);
    }
    return String(user);
};

// --- Sub-Components ---

const MessageBubble: React.FC<{
    msg: Message;
    isMe: boolean;
    isSystem: boolean;
    currentUser: any;
    onProfileClick: (user: any) => void;
}> = ({ msg, isMe, isSystem, currentUser, onProfileClick }) => {
    const isOptimistic = typeof msg._id === 'string' && msg._id.startsWith('optimistic_');
    const sender = typeof msg.senderId === 'object' ? msg.senderId : null;

    if (isSystem) {
        return (
            <div className="flex justify-center my-4 animate-fade-in">
                <span className="text-xs text-center text-gray-500 bg-gray-100 dark:bg-dark-card px-3 py-1 rounded-full shadow-sm border border-gray-200 dark:border-dark-border">
                    {msg.content}
                </span>
            </div>
        );
    }

    return (
        <div className={`flex w-full mb-2 group ${isMe ? 'justify-end' : 'justify-start items-end gap-2'}`}>
            {!isMe && (
                <div
                    className="mb-1 flex-shrink-0 cursor-pointer transition-transform hover:scale-110"
                    onClick={() => sender && onProfileClick(sender)}
                >
                    <Avatar src={sender?.avatar} alt={sender?.username || 'User'} size="xs" />
                </div>
            )}

            <div className={`flex flex-col max-w-[75%] md:max-w-[65%] ${isMe ? 'items-end' : 'items-start'}`}>
                <div
                    className={`
                        relative px-4 py-2 text-[15px] shadow-sm break-words whitespace-pre-wrap leading-relaxed
                        ${isMe
                            ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl rounded-tr-sm'
                            : 'bg-white dark:bg-dark-card text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-dark-border rounded-2xl rounded-tl-sm'}
                    `}
                >
                    {msg.content}
                </div>

                <div className={`flex items-center gap-1 mt-1 text-[10px] px-1 ${isMe ? 'text-gray-400' : 'text-gray-400'}`}>
                    <span>
                        {format(new Date(msg.createdAt), 'h:mm a')}
                    </span>
                    {isMe && (
                        <span className="ml-1">
                            {isOptimistic ? (
                                <div className="w-3 h-3 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin" />
                            ) : (
                                msg.readBy && msg.readBy.some((r: any) => getUserId(r.userId || r) !== getUserId(currentUser))
                                    ? <span className="text-primary-500 font-bold">Read</span>
                                    : <span className="text-gray-400">Sent</span>
                            )}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

const ConversationItem: React.FC<{
    conversation: Conversation;
    isActive: boolean;
    currentUser: any;
    onClick: () => void;
}> = ({ conversation, isActive, currentUser, onClick }) => {
    // Determine chat partner
    const getPartner = () => {
        if (!conversation.participants || conversation.participants.length === 0) return null;
        return conversation.participants.find(p => getUserId(p) !== getUserId(currentUser)) || conversation.participants[0];
    };

    const partner = getPartner();
    if (!partner) return null;

    const isUnread = (conversation.unreadCounts?.[getUserId(currentUser)] || 0) > 0;

    return (
        <div
            onClick={onClick}
            className={`
                flex items-center p-3 mx-2 rounded-xl cursor-pointer transition-all duration-200
                ${isActive
                    ? 'bg-primary-50 dark:bg-primary-900/10 border-l-4 border-primary-500'
                    : 'hover:bg-gray-50 dark:hover:bg-dark-bg border-l-4 border-transparent'}
            `}
        >
            <div className="relative">
                <Avatar src={partner.avatar} alt={partner.username} size="md" />
                {partner.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-dark-card rounded-full"></span>
                )}
            </div>

            <div className="ml-3 flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                    <h3 className={`font-semibold truncate text-sm ${isActive ? 'text-primary-700 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>
                        {partner.username}
                    </h3>
                    {conversation.lastMessageAt && (
                        <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">
                            {format(new Date(conversation.lastMessageAt), 'MMM d')}
                        </span>
                    )}
                </div>

                <div className="flex justify-between items-center mt-0.5">
                    <p className={`text-xs truncate max-w-[85%] ${isUnread ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                        {conversation.lastMessage?.content || 'Started a conversation'}
                    </p>
                    {isUnread && (
                        <span className="bg-primary-500 text-white text-[10px] font-bold px-1.5 h-4 min-w-[16px] flex items-center justify-center rounded-full ml-2">
                            {(conversation.unreadCounts?.[getUserId(currentUser)] || 0) > 9 ? '9+' : (conversation.unreadCounts?.[getUserId(currentUser)] || 0)}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---

const Messages: React.FC = () => {
    const { conversationId } = useParams();
    const navigate = useNavigate();
    const currentUser = useAppSelector(state => state.auth.user);
    const { makeCall } = useCall();

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');

    // Search & UI States
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Mobile sidebar toggle

    // Typing State
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
    const [isTyping, setIsTyping] = useState(false);

    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // --- Effects ---

    // Initial Fetch & Socket Connect
    useEffect(() => {
        if (currentUser) {
            fetchConversations();
            if (!socketService.getSocket()) {
                socketService.connect();
            }
        }
    }, [currentUser]);

    // Handle Mobile Responsive Sidebar
    useEffect(() => {
        if (conversationId) {
            setIsSidebarOpen(false); // Hide sidebar on mobile when chat opens
        } else {
            setIsSidebarOpen(true);
        }
    }, [conversationId]);

    const fetchConversations = async () => {
        if (!currentUser) return;
        try {
            const response = await messageService.getConversations();
            const data = Array.isArray(response) ? response : (response?.data || []);
            setConversations(data);
        } catch (error) {
            console.error('Failed to fetch conversations', error);
        }
    };

    // User Search
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }
        const delayDebounceFn = setTimeout(async () => {
            try {
                const response = await userService.searchUsers(searchQuery);
                const results = response.data || [];
                setSearchResults(results.filter(u => u._id !== currentUser?._id));
            } catch (error) {
                console.error('Search failed', error);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, currentUser]);

    // Conversation & Messages Logic
    useEffect(() => {
        if (!conversationId) return;

        const loadMessages = async () => {
            try {
                const response = await messageService.getMessages(conversationId);
                const data = Array.isArray(response) ? response : (response?.data || []);
                setMessages(data);
                setTimeout(scrollToBottom, 100);
            } catch (error) {
                console.error('Failed to load messages', error);
                toast.error('Could not load messages');
            }
        };

        loadMessages();
        socketService.joinConversation(conversationId);

        return () => {
            socketService.leaveConversation(conversationId);
        };
    }, [conversationId]);

    // --- Socket Event Listeners ---
    useEffect(() => {
        const handleNewMessage = (data: any) => {
            if (data.conversationId === conversationId) {
                setMessages(prev => {
                    const realMessage = data.message;
                    // Deduplication: Check ID
                    if (prev.some(m => m._id === realMessage._id)) return prev;

                    // Deduplication: Check Optimistic Replacement
                    const currentUserId = getUserId(currentUser);
                    if (getUserId(realMessage.senderId) === currentUserId) {
                        const optimisticMatch = prev.findIndex(m =>
                            typeof m._id === 'string' &&
                            m._id.startsWith('optimistic_') &&
                            m.content === realMessage.content
                        );
                        if (optimisticMatch !== -1) {
                            const updated = [...prev];
                            updated[optimisticMatch] = realMessage;
                            return updated;
                        }
                    }

                    return [...prev, realMessage];
                });
                setTimeout(scrollToBottom, 100);
            }

            // Update Conversation List Live
            setConversations(prev => {
                const updated = prev.map(c => {
                    if (c._id === data.conversationId) {
                        return {
                            ...c,
                            lastMessage: data.message,
                            lastMessageAt: new Date().toISOString(),
                            unreadCounts: {
                                ...c.unreadCounts,
                                [getUserId(currentUser)]: data.conversationId === conversationId ? 0 : ((c.unreadCounts?.[getUserId(currentUser)] || 0) + 1)
                            }
                        };
                    }
                    return c;
                });
                return updated.sort((a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime());
            });
        };

        const handleTypingUpdate = (data: any) => {
            if (data.conversationId === conversationId && data.userId !== currentUser?._id) {
                setTypingUsers(prev => {
                    const newSet = new Set(prev);
                    data.isTyping ? newSet.add(data.username) : newSet.delete(data.username);
                    return newSet;
                });
            }
        };

        const handleReadUpdate = (data: any) => {
            if (data.conversationId === conversationId) {
                setMessages(prev => prev.map(m => {
                    if (data.messageIds.includes(m._id)) {
                        // Avoid duplicates
                        if (m.readBy?.some(r => getUserId(r.userId || r) === data.readBy)) return m;
                        return {
                            ...m,
                            readBy: [...(m.readBy || []), { userId: data.readBy, readAt: new Date().toISOString() }]
                        };
                    }
                    return m;
                }));
            }
        };

        socketService.onNewMessage(handleNewMessage);
        socketService.onTyping(handleTypingUpdate);
        socketService.on('message:read:update', handleReadUpdate);

        return () => {
            socketService.off(SOCKET_EVENTS.MESSAGE_NEW, handleNewMessage);
            socketService.off(SOCKET_EVENTS.TYPING_UPDATE, handleTypingUpdate);
            socketService.off('message:read:update', handleReadUpdate);
        };
    }, [conversationId, currentUser]);

    // Send Message
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !conversationId || !currentUser) return;

        const content = newMessage.trim();
        const tempId = `optimistic_${Date.now()}`;

        // Optimistic UI Update
        const optimisticMsg: any = {
            _id: tempId,
            conversationId,
            senderId: getUserId(currentUser), // Strict string ID
            type: 'text',
            content,
            createdAt: new Date().toISOString(),
            readBy: []
        };

        setMessages(prev => [...prev, optimisticMsg]);
        setNewMessage('');
        setTimeout(scrollToBottom, 10);

        // Send
        if (socketService.isSocketConnected()) {
            socketService.sendMessage({ conversationId, type: 'text', content }, (response: any) => {
                const saved = response?.message || response;
                if (saved && saved._id) {
                    setMessages(prev => prev.map(m => m._id === tempId ? saved : m));
                    // Update conversation list optimistically
                    setConversations(prev => prev.map(c => c._id === conversationId ? { ...c, lastMessage: saved, lastMessageAt: new Date().toISOString() } : c));
                } else if (response?.error) {
                    toast.error(response.error);
                    setMessages(prev => prev.filter(m => m._id !== tempId));
                }
            });
        } else {
            // Fallback
            try {
                const saved = await messageService.sendMessage({ conversationId, type: 'text', content });
                setMessages(prev => prev.map(m => m._id === tempId ? saved : m));
            } catch (err) {
                toast.error('Failed to send');
                setMessages(prev => prev.filter(m => m._id !== tempId));
            }
        }
    };

    // Scroll Helper
    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    // --- Render ---

    if (!currentUser) return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div></div>;

    const currentConversation = conversations.find(c => c._id === conversationId);
    const chatPartner = currentConversation?.participants.find(p => getUserId(p) !== getUserId(currentUser))
        || currentConversation?.participants[0];

    return (
        <div className="flex h-[calc(100vh-6rem)] bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border overflow-hidden shadow-sm">

            {/* Sidebar (Conversation List) */}
            <div className={`
                ${isSidebarOpen ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-80 border-r border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card z-20
            `}>
                <div className="p-4 border-b border-gray-200 dark:border-dark-border">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            Messages
                        </h2>
                        <Button variant="ghost" size="sm" onClick={() => {
                            setIsSearching(!isSearching);
                            if (!isSearching) setSearchQuery('');
                        }} className="rounded-full w-8 h-8 p-0">
                            {isSearching ? <ChevronLeft className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
                        </Button>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input
                            placeholder="Search users..."
                            className="w-full pl-9 bg-gray-50 dark:bg-dark-bg border-gray-200 dark:border-dark-border rounded-lg text-sm transition-all focus:ring-2 focus:ring-primary-500 py-2"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                if (!isSearching && e.target.value.trim()) setIsSearching(true);
                            }}
                            onFocus={() => setIsSearching(true)}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => { setSearchQuery(''); setIsSearching(false); }}
                                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar py-2">
                    {/* Explicit search mode or if query exists */}
                    {(isSearching || searchQuery) ? (
                        <div>
                            {searchResults.length === 0 && searchQuery && <p className="text-center text-gray-500 mt-4 text-sm">No users found.</p>}
                            {searchResults.map(user => (
                                <div key={user._id} onClick={() => {
                                    // Check if existing conversation
                                    const exist = conversations.find(c => c.participants.some(p => getUserId(p) === user._id));
                                    if (exist) {
                                        navigate(`/messages/${exist._id}`);
                                        setIsSearching(false);
                                        setSearchQuery('');
                                    } else {
                                        messageService.createConversation(user._id).then(c => {
                                            setConversations(p => [c, ...p]);
                                            navigate(`/messages/${c._id}`);
                                            setIsSearching(false);
                                            setSearchQuery('');
                                        });
                                    }
                                }} className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-dark-bg cursor-pointer mx-2 rounded-lg transition-colors">
                                    <Avatar src={user.avatar} size="md" />
                                    <div className="ml-3">
                                        <p className="font-medium text-gray-900 dark:text-white">{user.username}</p>
                                        <p className="text-xs text-gray-500">{user.fullName}</p>
                                    </div>
                                </div>
                            ))}
                            {!searchQuery && (
                                <p className="text-center text-gray-400 text-sm mt-4">Type to search users...</p>
                            )}
                        </div>
                    ) : (
                        conversations.length > 0 ? (
                            conversations.map(conv => (
                                <ConversationItem
                                    key={conv._id}
                                    conversation={conv}
                                    isActive={conv._id === conversationId}
                                    currentUser={currentUser}
                                    onClick={() => navigate(`/messages/${conv._id}`)}
                                />
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                                <p>No conversations yet</p>
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Chat Area */}
            {conversationId ? (
                <div className={`
                    ${!isSidebarOpen ? 'flex' : 'hidden md:flex'} flex-col flex-1 bg-gray-50/50 dark:bg-black/20
                `}>
                    {/* Header */}
                    <div className="h-16 px-6 border-b border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card flex items-center justify-between shadow-sm z-10">
                        <div className="flex items-center gap-3">
                            <button className="md:hidden" onClick={() => navigate('/messages')}>
                                <ChevronLeft className="w-6 h-6 text-gray-600" />
                            </button>
                            {chatPartner ? (
                                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/profile/${chatPartner.username}`)}>
                                    <div className="relative">
                                        <Avatar src={chatPartner.avatar} size="sm" />
                                        {chatPartner.isOnline && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white leading-tight">{chatPartner.username}</h3>
                                        <p className="text-xs font-medium text-primary-500 h-4">
                                            {typingUsers.size > 0 ? 'Typing...' : (chatPartner.isOnline ? 'Active now' : '')}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="rounded-full" onClick={() => chatPartner && makeCall(getUserId(chatPartner), 'audio', chatPartner.username, chatPartner.avatar)}>
                                <Phone className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            </Button>
                            <Button variant="ghost" size="sm" className="rounded-full" onClick={() => chatPartner && makeCall(getUserId(chatPartner), 'video', chatPartner.username, chatPartner.avatar)}>
                                <Video className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            </Button>
                            <Button variant="ghost" size="sm" className="rounded-full">
                                <Info className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            </Button>
                        </div>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-1">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
                                <Avatar src={chatPartner?.avatar} size="xl" className="opacity-50" />
                                <p className="text-lg font-medium">Say hello to {chatPartner?.username}!</p>
                            </div>
                        )}

                        {messages.map((msg, idx) => {
                            const prev = messages[idx - 1];
                            const isNewDay = !prev || !isSameDay(new Date(msg.createdAt), new Date(prev.createdAt));

                            return (
                                <React.Fragment key={msg._id || idx}>
                                    {isNewDay && (
                                        <div className="flex justify-center my-6 sticky top-2 z-0">
                                            <span className="text-[10px] font-bold text-gray-500 bg-white/80 dark:bg-dark-card/80 backdrop-blur px-3 py-1 rounded-full shadow-sm">
                                                {format(new Date(msg.createdAt), 'MMMM d, yyyy')}
                                            </span>
                                        </div>
                                    )}
                                    <MessageBubble
                                        msg={msg}
                                        isMe={getUserId(msg.senderId) === getUserId(currentUser)}
                                        // Strict check: Only Type 'system' is system. Missing senderId is just weird user message.
                                        isSystem={msg.type === 'system'}
                                        currentUser={currentUser}
                                        onProfileClick={(u) => navigate(`/profile/${u.username}`)}
                                    />
                                </React.Fragment>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white dark:bg-dark-card border-t border-gray-200 dark:border-dark-border">
                        <form onSubmit={handleSendMessage} className="flex items-end gap-2 bg-gray-50 dark:bg-dark-bg p-2 rounded-3xl border border-gray-200 dark:border-dark-border focus-within:ring-2 focus-within:ring-primary-500/50 transition-all">
                            <div className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">
                                <Smile className="w-6 h-6" />
                            </div>
                            <textarea
                                value={newMessage}
                                onChange={e => {
                                    setNewMessage(e.target.value);
                                    // Typing logic here
                                    if (!isTyping) {
                                        setIsTyping(true);
                                        socketService.emitTypingStart(conversationId || '', currentUser.username);
                                        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                                        typingTimeoutRef.current = setTimeout(() => {
                                            setIsTyping(false);
                                            socketService.emitTypingStop(conversationId || '');
                                        }, 2000);
                                    }
                                }}
                                placeholder="Message..."
                                className="flex-1 bg-transparent border-0 focus:ring-0 text-sm py-3 min-h-[44px] max-h-32 resize-none"
                                rows={1}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage(e);
                                    }
                                }}
                            />
                            {newMessage.trim() ? (
                                <button type="submit" className="p-2 text-primary-500 hover:text-primary-600 font-bold transition-all transform hover:scale-110">
                                    Send
                                </button>
                            ) : (
                                <>
                                    <div className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer">
                                        <ImageIcon className="w-6 h-6" />
                                    </div>
                                    {/* <div className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer">
                                        <Heart className="w-6 h-6" />
                                    </div> */}
                                </>
                            )}
                        </form>
                    </div>

                </div>
            ) : (
                // Empty State (No Chat Selected)
                <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-white dark:bg-dark-card text-center p-8">
                    <div className="w-24 h-24 bg-gradient-to-tr from-purple-100 to-pink-100 dark:from-dark-bg dark:to-dark-card rounded-full flex items-center justify-center mb-6 shadow-sm border border-orange-50">
                        <Send className="w-10 h-10 text-primary-500 ml-1 mt-1" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Your Messages</h2>
                    <p className="text-gray-500 mb-6">Send private photos and messages to a friend or group.</p>
                    <Button variant="primary" onClick={() => setIsSearching(true)}>Send Message</Button>
                </div>
            )}
        </div>
    );
};

export default Messages;
