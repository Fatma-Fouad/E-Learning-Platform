import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import axios from 'axios';


import {
    fetchForumsByCourse,
    addThread,
    addReply,
    deleteThread,
    deleteReply,
    editThread,
    addForum,
    deleteForum,
    searchThreadsInCourse,
   
} from '../../utils/api';


interface ReplyNotification {
    threadId: string;
    replyId: string;
    content: string;
    creator: string;
    timestamp: string;
}

const CourseForumsPage = () => {
    const router = useRouter();
    const { courseId } = router.query;

    const [userId, setUserId] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [forums, setForums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newThread, setNewThread] = useState({ title: '', description: '' });
    const [newReply, setNewReply] = useState({ message: '', threadId: '' });
    const [editThreadData, setEditThreadData] = useState({ threadId: '', title: '', description: '' });
    const [newForumName, setNewForumName] = useState<string>('');
    const [showNewForumForm, setShowNewForumForm] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>(''); // For search input
    const [searchResults, setSearchResults] = useState([]); // For displaying search results
    const [isSearching, setIsSearching] = useState<boolean>(false); // To track search state


    // Load userId and role from localStorage
    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        const storedRole = localStorage.getItem('role');

        if (storedUserId) setUserId(storedUserId);
        if (storedRole) setUserRole(storedRole);
    }, []);

    const loadForums = async () => {
        setLoading(true);
        try {
            if (courseId && typeof courseId === 'string') {
                const data = await fetchForumsByCourse(courseId,userId);
                setForums(data);
            }
        } catch (err) {
            setError('Failed to fetch forums for this course.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadForums = async () => {
            // Normalize courseId
            const normalizedCourseId = Array.isArray(courseId) ? courseId[0] : courseId;

            if (!normalizedCourseId || !userId) {
                console.warn('⚠️ Waiting for valid courseId and userId...');
                return;
            }

            setLoading(true);
            try {
                console.log(`🔗 Fetching forums for courseId: ${normalizedCourseId}, userId: ${userId}`);
                const data = await fetchForumsByCourse(normalizedCourseId, userId);
                setForums(data);
                setError(null); // Clear previous errors
            } catch (err: any) {
                console.error('❌ Error fetching forums:', err.message);
                setError('Failed to fetch forums for this course.');
            } finally {
                setLoading(false);
            }
        };

        loadForums();
    }, [courseId, userId]);

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            toast.warn('⚠️ Please enter a search term.');
            return;
        }

        if (!courseId) {
            toast.error('❌ Course ID is missing.');
            return;
        }

        setIsSearching(true);
        try {
            console.log('🔗 Calling Backend API with:', { courseId, searchTerm });
            const data = await searchThreadsInCourse(courseId as string, searchTerm);

            if (Array.isArray(data)) {
                setSearchResults(data);
                setError(null);
                toast.success('✅ Search completed successfully!');
            } else {
                setSearchResults([]);
                setError('No threads found.');
                toast.warn('⚠️ No matching threads found.');
            }
        } catch (error: any) {
            console.error('❌ Search error:', error.message);
            setError(error.message || 'Failed to fetch search results.');
            setSearchResults([]);
            toast.error(`❌ ${error.message || 'Failed to fetch search results.'}`);
        } finally {
            setIsSearching(false);
        }
    };


    // Add new thread
    const handleAddThread = async () => {
        if (!userId) {
            setError('User ID is missing. Please log in.');
            return;
        }
        if (!newThread.title.trim()) { // Only validate title
            setError('Please provide a title for the thread.');
            return;
        }

        try {
            console.log('Adding thread with:', {
                courseId,
                title: newThread.title,
                description: newThread.description || 'No description provided',
                userId,
            });

            // Pass description only if provided
            await addThread(
                courseId as string,
                newThread.title,
                newThread.description || '', // Send empty string if no description is provided
                userId
            );

            setNewThread({ title: '', description: '' });
            setError(null);
            loadForums(); // Reload the forums
            alert('Thread added successfully!');
        } catch (error) {
            console.error('Error adding thread:', error);
            setError('Failed to add thread.');
        }
    };



    // Add reply
    const handleAddReply = async (threadId: string) => {
        if (!userId) {
            setError('User ID is missing. Please log in.');
            toast.error('❌ User ID is missing. Please log in.');
            return;
        }
        const replyMessage = newReply.threadId === threadId ? newReply.message.trim() : '';
        if (!replyMessage) {
            setError('Please enter a reply message.');
            toast.warn('⚠️ Please enter a reply message.');
            return;
        }

        try {
            await addReply(courseId as string, threadId, userId, replyMessage);
            setNewReply({ message: '', threadId: '' });
            setError(null);
            loadForums();
            toast.success('💬 Reply added successfully!');
        } catch {
            setError('Failed to add reply.');
            toast.error('❌ Failed to add reply.');
        }
    };

    // Delete thread
    const handleDeleteThread = async (threadId: string) => {
        try {
            await deleteThread(courseId as string, threadId, userId!);
            loadForums();
            alert('Thread deleted successfully!');
        } catch {
            setError('Failed to delete thread.');
        }
    };

    // Delete reply
    const handleDeleteReply = async (threadId: string, replyId: string) => {
        try {
            await deleteReply(courseId as string, threadId, replyId, userId!);
            setError(null);
            loadForums();
            alert('Reply deleted successfully!');
        } catch {
            setError('Failed to delete reply.');
        }
    };

    // Edit thread
    const handleEditThread = async () => {
        if (!editThreadData.title.trim() && !editThreadData.description.trim()) {
            setError('Please provide a title or description to update.');
            return;
        }

        try {
            await editThread(
                courseId as string,
                editThreadData.threadId,
                userId!,
                { title: editThreadData.title, description: editThreadData.description }
            );
            setEditThreadData({ threadId: '', title: '', description: '' });
            loadForums();
            alert('Thread updated successfully!');
        } catch {
            setError('Failed to update thread.');
        }
    };

    // Add forum (only for instructors)
    const handleAddForum = async () => {
        if (userRole !== 'instructor') {
            setError('Only instructors can add forums.');
            return;
        }
        if (!newForumName.trim()) {
            setError('Forum name is required.');
            return;
        }

        try {
            await addForum(courseId as string, newForumName, userId!);
            alert('Forum created successfully!');
            setNewForumName('');
            setShowNewForumForm(false);
            loadForums();
        } catch {
            setError('Failed to create forum.');
        }
    };

    // Delete forum (only for instructors)
    const handleDeleteForum = async (forumId: string) => {
        if (userRole !== 'instructor') {
            setError('Only instructors can delete forums.');
            return;
        }

        try {
            await deleteForum(forumId, userId!);
            alert('Forum deleted successfully!');
            loadForums();
        } catch {
            setError('Failed to delete forum.');
        }
    };

    if (loading) return <p>Loading forums...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (

        <div style={{
            padding: '20px',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#f9fafc',
            display: 'flex',
            justifyContent: 'center'
        }}>
            <div style={{
                maxWidth: '800px', /* ✅ Reduced width for better compact design */
                width: '100%',
                backgroundColor: '#fff',
                borderRadius: '8px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                padding: '20px'
            }}>
                {/* Display course name in the main header */}
                <h1 style={{
                    textAlign: 'center',
                    marginBottom: '30px',
                    color: '#2c3e50'
                }}>
                    Forums for Course: {forums.length > 0 && forums[0].courseName}
                </h1>

                {/* 🔍 Search Bar Section */}
                <div style={{
                    marginBottom: '30px',
                    textAlign: 'center',
                    padding: '15px',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    backgroundColor: '#fdfdfd'
                }}>
                    <h3 style={{ marginBottom: '10px', color: '#34495e' }}>🔍 Search Threads</h3>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '10px'
                    }}>
                        <input
                            type="text"
                            placeholder="Search threads..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSearch();
                            }}
                            style={{
                                padding: '8px',
                                width: '60%',
                                border: '1px solid #ccc',
                                borderRadius: '4px'
                            }}
                        />
                        <button
                            onClick={handleSearch}
                            style={{
                                padding: '8px 12px',
                                backgroundColor: '#3498db',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: isSearching ? 'not-allowed' : 'pointer'
                            }}
                            disabled={isSearching}
                        >
                            {isSearching ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                </div>

                {/* 🔍 Display Search Results */}
                {searchResults.length > 0 ? (
                    <div style={{
                        marginBottom: '30px',
                        padding: '15px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        backgroundColor: '#fdfdfd'
                    }}>
                        <h3 style={{ marginBottom: '10px', color: '#2c3e50' }}>🔍 Search Results</h3>
                        <ul style={{ listStyle: 'none', padding: '0' }}>
                            {searchResults.map((thread) => (
                                <li key={thread.threadId} style={{
                                    marginBottom: '20px',
                                    padding: '10px',
                                    borderBottom: '1px solid #eee'
                                }}>
                                    <h4 style={{ color: '#2980b9', marginBottom: '5px' }}>{thread.title}</h4>
                                    <p style={{ color: '#7f8c8d', marginBottom: '5px' }}>{thread.description}</p>
                                    <small style={{ color: '#999' }}>
                                        Created At: {new Date(thread.createdAt).toLocaleString()}
                                    </small>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <p style={{ textAlign: 'center', color: '#7f8c8d' }}>No results found. Try a different search term.</p>
                )}
                {/* Add New Thread Section */}
                <div style={{
                    marginBottom: '30px',
                    padding: '15px',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    backgroundColor: '#fdfdfd'
                }}>
                    <h3 style={{ marginBottom: '10px', color: '#34495e' }}>📝 Add New Thread</h3>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                    }}>
                        <input
                            type="text"
                            placeholder="Thread Title"
                            value={newThread.title}
                            onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                            style={{
                                padding: '8px',
                                border: '1px solid #ccc',
                                borderRadius: '4px'
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Thread Description"
                            value={newThread.description}
                            onChange={(e) => setNewThread({ ...newThread, description: e.target.value })}
                            style={{
                                padding: '8px',
                                border: '1px solid #ccc',
                                borderRadius: '4px'
                            }}
                        />
                        <button
                            onClick={handleAddThread}
                            style={{
                                padding: '8px 12px',
                                backgroundColor: '#2ecc71',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Add Thread
                        </button>
                    </div>
                </div>

                {/* Display Forums */}
                {forums.map((forum) => (
                    <div
                        key={forum._id}
                        style={{
                            marginBottom: '30px',
                            padding: '15px',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            backgroundColor: '#fdfdfd'
                        }}
                    >
                        {userRole === 'instructor' && (
                            <button
                                onClick={() => handleDeleteForum(forum._id)}
                                style={{
                                    marginBottom: '10px',
                                    backgroundColor: '#e74c3c',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '5px 10px',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Delete Forum
                            </button>
                        )}

                        {/* Threads */}
                        <ul style={{ listStyle: 'none', padding: '0' }}>
                            {forum.threads.map((thread) => (
                                <li
                                    key={thread.threadId}
                                    style={{
                                        marginBottom: '20px',
                                        padding: '10px',
                                        borderBottom: '1px solid #eee'
                                    }}
                                >
                                    <h4 style={{ marginBottom: '5px', color: '#2980b9' }}>{thread.title}</h4>
                                    <p style={{ marginBottom: '10px', color: '#7f8c8d' }}>{thread.description}</p>

                                    {/* Edit Thread */}
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '10px',
                                        marginBottom: '10px'
                                    }}>
                                        <input
                                            type="text"
                                            placeholder="Edit Title"
                                            value={editThreadData.threadId === thread.threadId ? editThreadData.title : ''}
                                            onChange={(e) =>
                                                setEditThreadData({
                                                    threadId: thread.threadId,
                                                    title: e.target.value,
                                                    description: editThreadData.description,
                                                })
                                            }
                                            style={{
                                                padding: '5px',
                                                border: '1px solid #ccc',
                                                borderRadius: '4px'
                                            }}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Edit Description"
                                            value={editThreadData.threadId === thread.threadId ? editThreadData.description : ''}
                                            onChange={(e) =>
                                                setEditThreadData({
                                                    threadId: thread.threadId,
                                                    description: e.target.value,
                                                    title: editThreadData.title,
                                                })
                                            }
                                            style={{
                                                padding: '5px',
                                                border: '1px solid #ccc',
                                                borderRadius: '4px'
                                            }}
                                        />
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button
                                                onClick={handleEditThread}
                                                style={{
                                                    backgroundColor: '#f39c12',
                                                    color: '#fff',
                                                    border: 'none',
                                                    padding: '5px 10px',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => handleDeleteThread(thread.threadId)}
                                                style={{
                                                    backgroundColor: '#e74c3c',
                                                    color: '#fff',
                                                    border: 'none',
                                                    padding: '5px 10px',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Delete Thread
                                            </button>
                                        </div>
                                    </div>

                                    {/* Add Reply */}
                                    <div style={{ marginTop: '10px' }}>
                                        <input
                                            type="text"
                                            placeholder="Reply message"
                                            value={newReply.threadId === thread.threadId ? newReply.message : ''}
                                            onChange={(e) =>
                                                setNewReply({ message: e.target.value, threadId: thread.threadId })
                                            }
                                            style={{
                                                width: '70%',
                                                padding: '5px',
                                                border: '1px solid #ccc',
                                                borderRadius: '4px'
                                            }}
                                        />
                                        <button
                                            onClick={() => handleAddReply(thread.threadId)}
                                            style={{
                                                marginLeft: '10px',
                                                backgroundColor: '#3498db',
                                                color: '#fff',
                                                border: 'none',
                                                padding: '5px 10px',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Add Reply
                                        </button>
                                    </div>

                                    {/* Replies */}
                                    <ul style={{ marginTop: '15px', paddingLeft: '20px' }}>
                                        {thread.replies.map((reply) => (
                                            <li key={reply.replyId} style={{ marginBottom: '5px' }}>
                                                <strong>{reply.userId.name}</strong>: {reply.message} (
                                                {new Date(reply.timestamp).toLocaleString()})
                                                <button
                                                    onClick={() => handleDeleteReply(thread.threadId, reply.replyId)}
                                                    style={{
                                                        marginLeft: '10px',
                                                        color: '#e74c3c',
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Delete Reply
                                                </button>
                                                
                                            </li>
                                        ))}
                                        
                                    </ul>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>


    );

}

export default CourseForumsPage;
