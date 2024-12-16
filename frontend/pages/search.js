import { useState } from 'react';
import { searchCourses, searchForums, searchThreadsInCourse } from '../utils/api';

const SearchPage = () => {
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearchCourses = async () => {
        try {
            setLoading(true);
            setError(null);
            const results = await searchCourses(query);
            console.log('Search Results:', searchResults);

            setSearchResults(results);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchForums = async () => {
        try {
            setLoading(true);
            setError(null);
            const results = await searchForums(query);
            console.log('Search Results:', searchResults);

            setSearchResults(results);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const [courseId, setCourseId] = useState(''); // Input for courseId

    const handleSearchThreads = async () => {
        try {
            setLoading(true);
            setError(null);

            if (!courseId.trim()) {
                throw new Error('Please provide a valid Course ID');
            }

            const results = await searchThreadsInCourse(courseId, query);
            console.log('Results:', results);
            setSearchResults(results);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div>
            <h1>Search</h1>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter search term"
            />
            <button onClick={handleSearchCourses}>Search Courses</button>
            <button onClick={handleSearchForums}>Search Forums</button>

            {/* Example courseId for thread search */}
            <button onClick={() => handleSearchThreads('example-course-id')}>
                Search Threads in Course
            </button>

            {loading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}

            <ul>
                {searchResults.length > 0 ? (
                    searchResults.map((result, index) => (
                        <li key={result.threadId || index}>
                            <strong>Course:</strong> {result.courseName} <br />
                            <strong>Thread:</strong> {result.threadTitle}
                        </li>
                    ))
                ) : (
                    <p>No results found.</p>
                )}
            </ul>


        </div>
    );
};

export default SearchPage;
