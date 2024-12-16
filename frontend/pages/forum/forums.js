import { useEffect, useState } from 'react';

const ForumsPage = () => {
    const [forums, setForums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchForums = async () => {
            try {
                const response = await fetch('http://localhost:3001/forums');
                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }
                const data = await response.json();
                setForums(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchForums();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            <h1>Forums</h1>
            {forums.length === 0 ? (
                <p>No forums available.</p>
            ) : (
                <ul>
                    {forums.map((forum) => (
                        <li key={forum._id}>{forum.title}</li> // Replace `forum.title` with the actual field name from your backend
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ForumsPage;
