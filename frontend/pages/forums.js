import { useEffect, useState } from 'react';
import { fetchForums } from '../utils/api';

const ForumsPage = () => {
    const [forums, setForums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadForums = async () => {
            try {
                const data = await fetchForums();
                console.log('Fetched Forums:', data);
                setForums(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadForums();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            <h1>Forums</h1>
            <ul>
                {forums.length > 0 ? (
                    forums.map((forum) => (
                        <li key={forum._id}>
                            <strong>{forum.courseName}</strong> <br />
                            Created By: {forum.createdBy} <br />
                            Course ID: {forum.courseId}
                        </li>
                    ))
                ) : (
                    <p>No forums available.</p>
                )}
            </ul>
        </div>
    );
};

export default ForumsPage;
