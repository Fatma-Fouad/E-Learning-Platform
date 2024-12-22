
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
    fetchChatsByCourse,
    fetchChatHistory,
    addMessageToChat,
    createChat,
} from '../../utils/api';
import { getSocket } from '../../utils/socket';
import { toast } from 'react-toastify';
import { useNotificationSocket } from '../notifications/useNotificationSocket';


const ChatsPage = () => {
    const router = useRouter();
    const { courseId } = router.query;
    const [chats, setChats] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedChat, setSelectedChat] = useState(null);
    const [chatName, setChatName] = useState('');
    const [error, setError] = useState('');
    const [userRole, setUserRole] = useState('');
    const [userId, setUserId] = useState('');
    const [selectedParticipantId, setSelectedParticipantId] = useState('');
    const [groupParticipants, setGroupParticipants] = useState<string[]>([]);
    const [isUserIdReady, setIsUserIdReady] = useState(false);

    useNotificationSocket(userId);
//load user info
    useEffect(() => {
        const role = localStorage.getItem('role');
        const user = localStorage.getItem('userId');
        setUserRole(role || '');
        setUserId(user || '');
        setIsUserIdReady(true);
    }, []);

    // ✅ Fetch Chats
    useEffect(() => {
        const loadChats = async () => {
            if (!router.isReady) {
                console.log('Router not ready, waiting...');
                return;
            }

            if (!courseId || Array.isArray(courseId)) {
                setError('Invalid course ID.');
                return;
            }
            if (!userId) {
                console.warn('User ID is not ready yet. Skipping chat fetch.');
                return;
            }

            try {
                console.log('Fetching chats:', { courseId, userId });
                const data = await fetchChatsByCourse(courseId as string, userId);
                setChats(data);
                console.log('✅ Chats loaded successfully:', data);
            } catch (err) {
                console.error('Failed to load chats:', err);
                setError('Failed to load chats.');
            }
        };

        if (isUserIdReady && userId) {
            loadChats();
        }
    }, [courseId, userId, isUserIdReady, router.isReady]);
    useEffect(() => {
        if (!userId || !selectedChat) return;

        const socket = getSocket(userId);

        // ✅ Join Chat Room
        socket.emit('joinChat', { chatId: selectedChat, userId });
        console.log(`🟢 Joined chat room: chat:${selectedChat}`);

        // ✅ Handle Real-Time Messages
        const handleNewMessage = (message) => {
            console.log('💬 Real-Time Message Received:', message);

            setMessages((prevMessages) => {
                // ✅ Prevent duplicates based on local flag and sender
                const isDuplicate = prevMessages.some(
                    (msg) =>
                        msg.sender === message.sender &&
                        msg.content === message.content &&
                        msg.timestamp === message.timestamp
                );

                if (isDuplicate) {
                    console.warn('⚠️ Duplicate message detected, skipping:', message);
                    return prevMessages; // Do not add duplicate
                }

                // ✅ Ignore messages flagged as local
                if (message.sender === userId && message.local) {
                    console.warn('⚠️ Skipping local message duplicate from WebSocket.');
                    return prevMessages;
                }

                return [
                    ...prevMessages,
                    {
                        sender: message.sender,
                        senderName: message.senderName || message.sender,
                        content: message.content,
                        timestamp: message.timestamp || new Date().toISOString(),
                    },
                ];
            });
        };


        // ✅ Prevent Duplicate Listeners
        socket.off('OnMessage'); // Clear previous listeners
        socket.on('OnMessage', handleNewMessage);

        // ✅ Handle Errors
        socket.off('error'); // Clear any previous error listener
        socket.on('error', (error) => {
            console.error('❌ Socket Error:', error);
        });

        // ✅ Cleanup on Unmount
        return () => {
            socket.off('OnMessage', handleNewMessage);
            socket.off('error');
            socket.emit('leaveChat', { chatId: selectedChat, userId });
            console.log(`🛑 Left chat room: chat:${selectedChat}`);
        };
    }, [userId, selectedChat]);

    // Fetch chat history
    const loadChatHistory = async (chatId: string) => {
        try {
            const data = await fetchChatHistory(chatId);
            setMessages(data);
            setSelectedChat(chatId);

            //  Join chat room
            const socket = getSocket(userId);
            socket.emit('joinChat', { chatId, userId });

            socket.on('joinedChat', (response) => {
                console.log('✅ Successfully joined chat:', response);
            });

            socket.on('error', (error) => {
                console.error('❌ Error joining chat:', error);
            });
        } catch (err) {
            console.error('❌ Failed to load chat history:', err);
            setError('Failed to load chat history.');
        }
    };


    // Send a message
    // Initialize socket
   
    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedChat) return;

        const socket = getSocket(userId);
        try {
            const payload = { sender: userId, content: newMessage.trim() };

            // ✅ Save message in the database
            await addMessageToChat(selectedChat, payload);

            // ✅ Update local state immediately for the sender
            setMessages((prev) => [
                ...prev,
                {
                    sender: userId,
                    senderName: 'You',
                    content: newMessage,
                    timestamp: new Date().toISOString(),
                    local: true, // Add a flag for local messages
                },
            ]);
            setNewMessage('');

            // ✅ Emit Real-Time Event
            if (socket) {
                socket.emit('sendMessage', {
                    chatId: selectedChat,
                    sender: userId,
                    content: newMessage,
                    timestamp: new Date().toISOString(),
                });
                console.log('📤 Real-time message sent:', newMessage);
            }
        } catch (err) {
            console.error('❌ Error sending message:', err);
            setError('Failed to send message.');
        }
    };


    // Add a participant for group chat
    const handleAddParticipant = (participantId: string) => {
        if (!participantId.trim()) {
            setError('Participant ID cannot be empty.');
            return;
        }
        if (groupParticipants.includes(participantId.trim())) {
            setError('Participant already added.');
            return;
        }
        setGroupParticipants((prev) => [...prev, participantId.trim()]);
        setError(''); // Clear any previous error
    };

    // Remove a participant
    const handleRemoveParticipant = (index: number) => {
        setGroupParticipants((prev) => prev.filter((_, i) => i !== index));
    };

    // Create a new chat
    const handleCreateChat = async (type: 'student' | 'mixed' | 'group') => {
        if (!courseId || Array.isArray(courseId)) {
            setError('Invalid course ID.');
            return;
        }

        if (!chatName.trim()) {
            setError('Chat name is required.');
            return;
        }

        if (!userId) {
            setError('User ID is not set. Please refresh the page or log in again.');
            return;
        }

        let participantIds: string[] = [];

        if (type === 'group') {
            participantIds = [...new Set([...groupParticipants, userId])];
        } else if (type === 'student') {
            if (!selectedParticipantId.trim()) {
                setError('Participant ID is required for One-to-One chat.');
                return;
            }
            participantIds = [selectedParticipantId, userId];
        } else {
            participantIds = [userId];
        }

        const payload = {
            chatName,
            participantId: selectedParticipantId, // Ensure this is correctly set for one-to-one
            participantIds,
            courseId: courseId as string,
            userId,
        };

        console.log('🚀 Payload for chat creation:', payload);

        try {
            await createChat(type, payload);
            const updatedChats = await fetchChatsByCourse(courseId as string, userId);
            setChats(updatedChats);
            setChatName('');
            setGroupParticipants([]);
            setSelectedParticipantId('');
            alert(
                `${type === 'mixed'
                    ? 'Mixed'
                    : type === 'group'
                        ? 'Group'
                        : 'One-to-One'} chat created successfully!`
            );
        } catch (err) {
            console.error('❌ Error creating chat:', err);
            setError('Failed to create chat.');
        }
    };



    return (
        <div style={{
            padding: '20px',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#f9fafc',
            display: 'flex',
            justifyContent: 'center'
        }}>
            <div style={{
                maxWidth: '800px', /* ✅ Compact width */
                width: '100%',
                backgroundColor: '#fff',
                borderRadius: '8px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                padding: '20px'
            }}>
                {/* Header */}
                <h1 style={{
                    textAlign: 'center',
                    marginBottom: '30px',
                    color: '#2c3e50'
                }}>
                    💬 Chats for Course {courseId}
                </h1>

                {/* Available Chats */}
                <div style={{
                    marginBottom: '30px',
                    padding: '15px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    backgroundColor: '#fdfdfd'
                }}>
                    <h2 style={{ marginBottom: '10px', color: '#34495e' }}>🗂️ Available Chats</h2>
                    {chats.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {chats.map((chat) => (
                                <li key={chat._id} style={{
                                    marginBottom: '10px'
                                }}>
                                    <button
                                        onClick={() => loadChatHistory(chat._id)}
                                        style={{
                                            padding: '8px 12px',
                                            backgroundColor: '#3498db',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            width: '100%',
                                            textAlign: 'left'
                                        }}
                                    >
                                        {chat.chatName}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p style={{ color: '#7f8c8d' }}>No chats available for this course.</p>
                    )}
                </div>

                {/* Create New Chat */}
                <div style={{
                    marginBottom: '30px',
                    padding: '15px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    backgroundColor: '#fdfdfd'
                }}>
                    <h3 style={{ marginBottom: '10px', color: '#34495e' }}>➕ Create New Chat</h3>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                    }}>
                        <input
                            type="text"
                            placeholder="Enter chat name"
                            value={chatName}
                            onChange={(e) => setChatName(e.target.value)}
                            style={{
                                padding: '8px',
                                border: '1px solid #ccc',
                                borderRadius: '4px'
                            }}
                        />
                        {/* One-to-One Chat */}
                        {userRole === 'student' && (
                            <div>
                                <h4 style={{ marginBottom: '5px', color: '#2980b9' }}>👤 One-to-One Chat</h4>
                                <input
                                    type="text"
                                    placeholder="Enter participant ID"
                                    value={selectedParticipantId}
                                    onChange={(e) => setSelectedParticipantId(e.target.value)}
                                    style={{
                                        padding: '8px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        marginBottom: '10px'
                                    }}
                                />
                                <button
                                    onClick={() => handleCreateChat('student')}
                                    style={{
                                        backgroundColor: '#2ecc71',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '8px 12px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Create One-to-One Chat
                                </button>
                            </div>
                        )}

                        {/* Group Chat */}
                        {userRole === 'student' && (
                            <div>
                                <h4 style={{ marginBottom: '5px', color: '#2980b9' }}>👥 Group Chat Participants</h4>
                                <input
                                    type="text"
                                    placeholder="Enter participant ID"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                            handleAddParticipant(e.currentTarget.value);
                                            e.currentTarget.value = ''; // Clear input after adding
                                        }
                                    }}
                                    style={{
                                        padding: '8px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        marginBottom: '10px'
                                    }}
                                />
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {groupParticipants.map((id, index) => (
                                        <li key={index} style={{
                                            marginBottom: '5px'
                                        }}>
                                            {id}
                                            <button
                                                onClick={() => handleRemoveParticipant(index)}
                                                style={{
                                                    color: '#e74c3c',
                                                    marginLeft: '10px',
                                                    border: 'none',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Remove
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    onClick={() => handleCreateChat('group')}
                                    style={{
                                        backgroundColor: '#8e44ad',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '8px 12px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Create Group Chat
                                </button>
                            </div>
                        )}

                        {/* Mixed Chat */}
                        {userRole === 'instructor' && (
                            <button
                                onClick={() => handleCreateChat('mixed')}
                                style={{
                                    backgroundColor: '#f39c12',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '8px 12px',
                                    cursor: 'pointer'
                                }}
                            >
                                Create Mixed Chat
                            </button>
                        )}
                    </div>
                    {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
                </div>

                {/* Chat Messages */}
                {selectedChat && (
                    <div style={{
                        marginTop: '20px',
                        border: '1px solid #ccc',
                        padding: '15px',
                        borderRadius: '8px',
                        backgroundColor: '#fdfdfd'
                    }}>
                        <h2 style={{ marginBottom: '10px', color: '#2c3e50' }}>💬 Chat Messages</h2>
                        <div style={{
                            height: '300px',
                            overflowY: 'scroll',
                            border: '1px solid #ddd',
                            padding: '10px',
                            marginBottom: '10px'
                        }}>
                            {messages.map((msg, index) => {
                                const isCurrentUser = msg.sender === userId || msg.senderName === 'You';

                                return (
                                    <p key={index}>
                                        <strong style={{
                                            color: isCurrentUser ? '#2ecc71' : '#3498db'
                                        }}>
                                            {isCurrentUser ? 'You' : msg.senderName || msg.sender}:
                                        </strong>
                                        {' '}
                                        {msg.content}
                                    </p>
                                );
                            })}


                        </div>
                        {/* ✅ Message Input */}
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            style={{
                                width: '80%',
                                marginRight: '10px',
                                padding: '8px',
                                border: '1px solid #ccc',
                                borderRadius: '4px'
                            }}
                        />
                        <button
                            onClick={handleSendMessage}
                            style={{
                                padding: '8px 12px',
                                backgroundColor: '#3498db',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px'
                            }}
                        >
                            Send
                        </button>
                    </div>
                )}
            </div>
        </div>

    );
};

export default ChatsPage;