
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

            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    sender: message.sender,
                    content: message.content,
                    timestamp: message.timestamp || new Date().toISOString(),
                },
            ]);
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
                { sender: 'You', content: newMessage, timestamp: new Date().toISOString() },
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
        <div style={{ padding: '20px' }}>
            <h1>Chats for Course {courseId}</h1>

            <div>
                <h2>Available Chats</h2>
                {chats.length > 0 ? (
                    <ul>
                        {chats.map((chat) => (
                            <li key={chat._id}>
                                <button onClick={() => loadChatHistory(chat._id)}>
                                    {chat.chatName}
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No chats available for this course.</p>
                )}
            </div>

            <div style={{ marginTop: '20px' }}>
                <h3>Create New Chat</h3>
                <input
                    type="text"
                    placeholder="Enter chat name"
                    value={chatName}
                    onChange={(e) => setChatName(e.target.value)}
                    style={{ marginRight: '10px', padding: '5px' }}
                />
                {/* One-to-One Chat (Only for Students) */}
                {/* Create One-to-One Chat */}
                {userRole === 'student' && (
                    <div>
                        <h4>Create One-to-One Chat</h4>
                        <input
                            type="text"
                            placeholder="Enter participant ID"
                            value={selectedParticipantId}
                            onChange={(e) => setSelectedParticipantId(e.target.value)}
                        />
                        <button onClick={() => handleCreateChat('student')}>
                            Create One-to-One Chat
                        </button>
                    </div>
                )}

                {userRole === 'student' && (
                    <div>
                        <h4>Group Chat Participants</h4>
                        <input
                            type="text"
                            placeholder="Enter participant ID"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                    handleAddParticipant(e.currentTarget.value);
                                    e.currentTarget.value = ''; // Clear input after adding
                                }
                            }}
                            style={{ marginRight: '10px', padding: '5px' }}
                        />
                        <ul>
                            {groupParticipants.map((id, index) => (
                                <li key={index}>
                                    {id}{' '}
                                    <button
                                        onClick={() => handleRemoveParticipant(index)}
                                        style={{ color: 'red', marginLeft: '10px' }}
                                    >
                                        Remove
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {userRole === 'instructor' && (
                    <button onClick={() => handleCreateChat('mixed')}>
                        Create Mixed Chat
                    </button>
                )}
                {userRole === 'student' && (
                    <>
                        
                        <button onClick={() => handleCreateChat('group')}>
                            Create Group Chat
                        </button>
                    </>
                )}
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </div>

            {selectedChat && (
                <div style={{ marginTop: '20px' }}>
                    <h2>Chat Messages</h2>
                    <div
                        style={{
                            border: '1px solid #ccc',
                            padding: '10px',
                            height: '300px',
                            overflowY: 'scroll',
                        }}
                    >
                        {messages.map((msg, index) => (
                            <p key={index}>
                                <strong>{msg.sender === userId ? 'You' : msg.sender}:</strong> {msg.content}
                            </p>
                        ))}
                    </div>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        style={{ width: '80%', marginRight: '10px' }}
                    />
                    <button onClick={handleSendMessage}>Send</button>
                </div>

            )}
        </div>
    );
};

export default ChatsPage;