import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { fetchForumsByCourse, addThread, addReply, addForum, deleteForum } from '../../utils/api';

const TEMP_USER_ID = '675497c45af839c9e2ef74c0'; // Replace with dynamic user ID
const TEMP_USER_ROLE = 'instructor'; // Replace with dynamic user role (e.g., fetched from login)

interface Thread {
    threadId: string;
    title: string;
    description: string;
    replies: any[];
}

interface Forum {
    _id: string;
    courseId: string;
    courseName: string;
    createdBy: string;
    threads: Thread[];
}

const CourseForumsPage = () => {
    const router = useRouter();
    const { courseId } = router.query;

    const [forums, setForums] = useState<Forum[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [newForumName, setNewForumName] = useState<string>(''); // Forum name
    const [showNewForumForm, setShowNewForumForm] = useState<boolean>(false);

    // Fetch forums
    const loadForums = async () => {
        setLoading(true);
        try {
            if (courseId) {
                const data = await fetchForumsByCourse(courseId as string);
                setForums(data);
            }
        } catch (err) {
            setError('Failed to fetch forums.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadForums();
    }, [courseId]);

    // Add Forum
    const handleAddForum = async () => {
        if (!newForumName.trim()) {
            setError('Forum name is required.');
            return;
        }

        try {
            await addForum(courseId as string, newForumName, TEMP_USER_ID);
            alert('Forum created successfully');
            setNewForumName('');
            setShowNewForumForm(false);
            loadForums();
        } catch (err) {
            setError('Failed to create forum.');
        }
    };

    // Delete Forum
    const handleDeleteForum = async (forum: Forum) => {
        try {
            await deleteForum(forum._id, TEMP_USER_ID); // Send the forum ID here
            alert('Forum deleted successfully');
            loadForums(); // Reload the forums
        } catch (err) {
            setError('Failed to delete forum.');
        }
    };


    return (
        <div style={{ padding: '20px' }}>
            <h1>Forums</h1>

            {/* Only Instructors can see this */}
            {TEMP_USER_ROLE === 'instructor' && (
                <>
                    <button onClick={() => setShowNewForumForm(!showNewForumForm)} style={{ marginBottom: '10px' }}>
                        {showNewForumForm ? 'Cancel' : 'Create New Forum'}
                    </button>

                    {showNewForumForm && (
                        <div>
                            <input
                                type="text"
                                placeholder="Forum Name"
                                value={newForumName}
                                onChange={(e) => setNewForumName(e.target.value)}
                                style={{ padding: '5px', marginRight: '10px' }}
                            />
                            <button onClick={handleAddForum} style={{ padding: '5px' }}>
                                Add Forum
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Display Forums */}
            {loading ? (
                <p>Loading forums...</p>
            ) : forums.length > 0 ? (
                forums.map((forum) => (
                    <div key={forum._id} style={{ marginBottom: '20px', borderBottom: '1px solid #ccc' }}>
                        <h3>{forum.courseName}</h3>
                        {TEMP_USER_ROLE === 'instructor' && forum.createdBy === TEMP_USER_ID && (
                            <button onClick={() => handleDeleteForum(forum)} style={{ color: 'red' }}>
                                Delete Forum
                            </button>

                        )}
                    </div>
                ))
            ) : (
                <p>No forums available for this course.</p>
            )}

            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default CourseForumsPage;