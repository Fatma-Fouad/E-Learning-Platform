import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { fetchCourses, searchCoursesByKeyword } from '../../utils/api';

interface Course {
  _id: string;
  title: string;
}

const CoursesPage = () => {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [noResults, setNoResults] = useState<boolean>(false);

  // Load all courses on component mount
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data: Course[] = await fetchCourses();
        setCourses(data);
        setNoResults(false);
      } catch (err) {
        setError('Failed to fetch courses.');
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  // Handle search
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError('Please enter a valid search term.');
      setNoResults(false);
      return;
    }

    try {
      setLoading(true);
      const result = await searchCoursesByKeyword(searchTerm.trim());
      if (result.courses.length === 0) {
        setNoResults(true);
      } else {
        setCourses(result.courses);
        setNoResults(false);
      }
    } catch (err) {
      setError('Failed to search courses.');
    } finally {
      setLoading(false);
    }
  };

  // Reset search
  const handleReset = async () => {
    setSearchTerm('');
    setLoading(true);
    setNoResults(false);
    try {
      const data: Course[] = await fetchCourses();
      setCourses(data);
    } catch (err) {
      setError('Failed to reset courses.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Available Courses</h1>

      {/* Search Section */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search for courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '5px', marginRight: '10px' }}
        />
        <button
          onClick={handleSearch}
          style={{ padding: '5px 10px', cursor: 'pointer', background: 'blue', color: 'white' }}
        >
          Search
        </button>
        <button
          onClick={handleReset}
          style={{ padding: '5px 10px', cursor: 'pointer', background: 'gray', color: 'white', marginLeft: '10px' }}
        >
          Reset
        </button>
      </div>

      {/* Display No Results Message */}
      {noResults && <p style={{ color: 'red' }}>No courses match your search term.</p>}

      {/* Display Courses */}
      {courses.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {courses.map((course) => (
            <li key={course._id} style={{ marginBottom: '10px' }}>
              <button
                onClick={() => router.push(`/courses/${course._id}`)}
                style={{
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  color: 'blue',
                  textDecoration: 'underline',
                  fontSize: '16px',
                }}
              >
                {course.title}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        !noResults && <p style={{ color: 'gray' }}>No courses available.</p>
      )}
    </div>
  );
};

export default CoursesPage;