import { useEffect, useState } from 'react';
import api from '../../utilities/api'; // Import the Axios instance

export default function Forums() {
    const [forums, setForums] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchForums() {
            try {
                const response = await api.get('/'); // API call to get all forums
                setForums(response.data);
            } catch (error) {
                console.error('Error fetching forums:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchForums();
    }, []);

    if (loading) {
        return <p>Loading forums...</p>;
    }

    return (
        <div>
        <h1>Forums </h1>
      {
        forums.length > 0 ? (
            <ul>
            {
                forums.map((forum) => (
                    <li key= { forum._id } >
                    { forum.courseName } - Created by: { forum.createdBy }
                </li>
                ))
            }
            </ul>
        ) : (
        <p>No forums available </p>
      )
    }
    </div>
  );
}
