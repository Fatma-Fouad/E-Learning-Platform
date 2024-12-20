import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
    fetchForumsByCourse,
    addThread,
    addReply,
    deleteThread,
    deleteReply,
    editThread,
    addForum,
    deleteForum,
} from '../../utils/api';

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

    // Load userId and role from localStorage
    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        const storedRole = localStorage.getItem('role');
        setUserId(storedUserId);
        setUserRole(storedRole);
    }, []);

    const loadForums = async () => {
        setLoading(true);
        try {
            if (courseId && typeof courseId === 'string') {
                const data = await fetchForumsByCourse(courseId);
                setForums(data);
            }
        } catch (err) {
            setError('Failed to fetch forums for this course.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadForums();
    }, [courseId]);

    // Add new thread
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
            return;
        }
        const replyMessage = newReply.threadId === threadId ? newReply.message.trim() : '';
        if (!replyMessage) {
            setError('Please enter a reply message.');
            return;
        }

        try {
            await addReply(courseId as string, threadId, userId, replyMessage);
            setNewReply({ message: '', threadId: '' });
            setError(null);
            loadForums();
            alert('Reply added successfully!');
        } catch {
            setError('Failed to add reply.');
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
        <div style={{ padding: '20px' }}>
            {/* Display course name in the main header */}
            <h1>Forums for Course: {forums.length > 0 && forums[0].courseName}</h1>

            {/* Add New Thread */}
            <div style={{ marginBottom: '20px' }}>
                <h3>Add New Thread</h3>
                <input
                    type="text"
                    placeholder="Thread Title"
                    value={newThread.title}
                    onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                    style={{ padding: '5px', marginRight: '10px' }}
                />
                <input
                    type="text"
                    placeholder="Thread Description"
                    value={newThread.description}
                    onChange={(e) => setNewThread({ ...newThread, description: e.target.value })}
                    style={{ padding: '5px', marginRight: '10px' }}
                />
                <button onClick={handleAddThread}>Add Thread</button>
            </div>

            {/* Display Forums */}
            {forums.map((forum) => (
                <div key={forum._id} style={{ marginBottom: '20px' }}>
                    {userRole === 'instructor' && (
                        <button onClick={() => handleDeleteForum(forum._id)} style={{ color: 'red' }}>
                            Delete Forum
                        </button>
                    )}
                    <ul>
                        {forum.threads.map((thread) => (
                            <li key={thread.threadId}>
                                <strong>{thread.title}</strong>
                                <p>{thread.description}</p>

                                {/* Edit Thread */}
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
                                />
                                <button onClick={handleEditThread}>Save</button>
                                <button onClick={() => handleDeleteThread(thread.threadId)} style={{ color: 'red' }}>
                                    Delete Thread
                                </button>

                                {/* Add Reply */}
                                <input
                                    type="text"
                                    placeholder="Reply message"
                                    value={newReply.threadId === thread.threadId ? newReply.message : ''}
                                    onChange={(e) =>
                                        setNewReply({ message: e.target.value, threadId: thread.threadId })
                                    }
                                />
                                <button onClick={() => handleAddReply(thread.threadId)}>Add Reply</button>

                                {/* Replies */}
                                <ul>
                                    {thread.replies.map((reply) => (
                                        <li key={reply.replyId}>
                                            <strong>{reply.userId.name}</strong> {/* Display user's name */}
                                            : {reply.message} ({new Date(reply.timestamp).toLocaleString()})
                                            <button
                                                onClick={() => handleDeleteReply(thread.threadId, reply.replyId)}
                                                style={{ color: 'red', marginLeft: '10px' }}
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
    );

}

export default CourseForumsPage;
