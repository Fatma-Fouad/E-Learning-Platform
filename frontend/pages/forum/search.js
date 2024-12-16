import { useState } from 'react';
import api from '../../utilities/api';

export default function SearchForum() {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [error, setError] = useState('');

    const handleSearch = async () => {
        try {
            const response = await api.get(`/forums/search?q=${searchTerm}`);
            setResults(response.data);
        } catch (error) {
            setError('Error searching forums.');
            console.error(error.message);
        }
    };

    return (
        <div>
            <h1>Search Forums</h1>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search term"
            />
            <button onClick={handleSearch}>Search</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {results.length > 0 ? (
                <ul>
                    {results.map((result) => (
                        <li key={result._id}>
                            {result.courseName} - Created by: {result.createdBy?.name || 'Unknown'}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No results found.</p>
            )}
        </div>
    );
}
