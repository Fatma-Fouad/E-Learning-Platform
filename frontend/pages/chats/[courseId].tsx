import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
    fetchChatsByCourse,
    fetchChatHistory,
    addMessageToChat,
    createChat,
} from '../../utils/api';

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
    const [groupParticipants, setGroupParticipants] = useState<string[]>([]);

    // Load user information
    useEffect(() => {
        const role = localStorage.getItem('role');
        const user = localStorage.getItem('userId');
        setUserRole(role || '');
        setUserId(user || '');
    }, []);

    // Fetch chats for the course
    useEffect(() => {
        const loadChats = async () => {
            if (!courseId || Array.isArray(courseId)) {
                setError('Invalid course ID.');
                return;
            }

            try {
                const data = await fetchChatsByCourse(courseId as string, userId);
                setChats(data);
            } catch (err) {
                setError('Failed to load chats.');
            }
        };

        loadChats();
    }, [courseId, userId]);

    // Fetch chat history
    const loadChatHistory = async (chatId: string) => {
        try {
            const data = await fetchChatHistory(chatId);
            setMessages(data);
            setSelectedChat(chatId);
        } catch (err) {
            setError('Failed to load chat history.');
        }
    };

    // Send a message
    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedChat) return;

        try {
            const payload = { sender: userId, content: newMessage.trim() };
            await addMessageToChat(selectedChat, payload);
            setMessages((prev) => [...prev, { sender: 'You', content: newMessage }]);
            setNewMessage('');
        } catch (err) {
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
            setError('User ID is missing.');
            return;
        }

        const participantIds =
            type === 'group' ? [...new Set([...groupParticipants, userId])] : [userId]; // Ensure no duplicates

        const payload = { chatName, participantIds, courseId: courseId as string, userId };

        try {
            console.log('Payload for chat creation:', payload);
            await createChat(type, payload);
            const updatedChats = await fetchChatsByCourse(courseId as string, userId);
            setChats(updatedChats);
            setChatName('');
            setGroupParticipants([]);
            alert(
                `${type === 'mixed'
                    ? 'Mixed'
                    : type === 'group'
                        ? 'Group'
                        : 'One-to-One'} chat created successfully!`
            );
        } catch (err) {
            console.error('Error creating chat:', err);
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
                        <button onClick={() => handleCreateChat('student')}>
                            Create One-to-One Chat
                        </button>
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
                                <strong>{msg.sender}:</strong> {msg.content}
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
