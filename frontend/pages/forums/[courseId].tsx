import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
    fetchForumsByCourse,
    addThread,
    addReply,
    deleteThread,
    deleteReply,
    editThread,
} from '../../utils/api';

const TEMP_USER_ID = '6746676e0e44216ab25adb75'; // Replace with a real ObjectId

const CourseForumsPage = () => {
    const router = useRouter();
    const { courseId } = router.query;

    const [forums, setForums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [newThread, setNewThread] = useState({ title: '', description: '' });
    const [newReply, setNewReply] = useState({ message: '', threadId: '' });
    const [editThreadData, setEditThreadData] = useState({ threadId: '', title: '', description: '' });

    // Load forums
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
    const handleAddThread = async () => {
        if (!newThread.title.trim() || !newThread.description.trim()) {
            setError('Please provide both a title and description for the thread.');
            return;
        }

        try {
            await addThread(courseId as string, newThread.title, newThread.description, TEMP_USER_ID);
            setNewThread({ title: '', description: '' });
            setError(null);
            loadForums();
            alert('Thread added successfully!');
        } catch {
            setError('Failed to add thread.');
        }
    };

    // Add reply
    const handleAddReply = async (threadId: string) => {
        const replyMessage = newReply.threadId === threadId ? newReply.message.trim() : '';
        if (!replyMessage) {
            setError('Please enter a reply message.');
            return;
        }

        try {
            await addReply(courseId as string, threadId, TEMP_USER_ID, replyMessage);
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
            await deleteThread(courseId as string, threadId, TEMP_USER_ID);
            setError(null);
            loadForums();
            alert('Thread deleted successfully!');
        } catch {
            setError('Failed to delete thread.');
        }
    };

    // Delete reply
    const handleDeleteReply = async (threadId: string, replyId: string) => {
        try {
            await deleteReply(courseId as string, threadId, replyId, TEMP_USER_ID);
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
                TEMP_USER_ID,
                { title: editThreadData.title, description: editThreadData.description }
            );
            setEditThreadData({ threadId: '', title: '', description: '' });
            setError(null);
            loadForums();
            alert('Thread updated successfully!');
        } catch {
            setError('Failed to update thread.');
        }
    };

    if (loading) return <p>Loading forums...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div style={{ padding: '20px' }}>
            <h1>Forums for Course</h1>

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
                    <h3>{forum.courseName}</h3>
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
                                            <strong>
                                                {typeof reply.userId === 'object' ? reply.userId.name : reply.userId}
                                            </strong>
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
};

export default CourseForumsPage;
