import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { fetchCourseById } from '../../utils/api';

interface Course {
    _id: string;
    title: string;
    description: string;
    category: string;
    difficulty_level: string;
    enrolled_students: number;
    course_rating: number;
    created_at: string;
    nom_of_modules: number;
    completed_students: number;
}

const CourseDetailPage = () => {
    const router = useRouter();
    const { id } = router.query; // Extract course ID

    const [course, setCourse] = useState < Course | null > (null);
    const [loading, setLoading] = useState < boolean > (true);
    const [error, setError] = useState < string | null > (null);

    useEffect(() => {
        const loadCourse = async () => {
            try {
                if (id && typeof id === 'string') {
                    const data: Course = await fetchCourseById(id);
                    setCourse(data);
                }
            } catch (err) {
                setError('Failed to fetch course details.');
            } finally {
                setLoading(false);
            }
        };

        loadCourse();
    }, [id]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div style={{ padding: '20px' }}>
            <h1>{course?.title}</h1>
            <p><strong>Description:</strong> {course?.description}</p>
            <p><strong>Category:</strong> {course?.category}</p>
            <p><strong>Difficulty Level:</strong> {course?.difficulty_level}</p>
            <p><strong>Enrolled Students:</strong> {course?.enrolled_students}</p>
            <p><strong>Rating:</strong> {course?.course_rating} / 5</p>

            <button
                onClick={() => router.push(`/forums/${id}`)}
                style={{ marginTop: '20px', padding: '10px', backgroundColor: '#0070f3', color: '#fff' }}
            >
                Go to Course Forums
            </button>
            <button
                onClick={() => router.push(`/chats/${id}`)} // Ensure `id` is passed correctly
                style={{ marginLeft: '10px', padding: '10px', backgroundColor: '#0070f3', color: '#fff' }}
            >
                Go to Course Chats
            </button>


            <button
                onClick={() => router.push('/courses')}
                style={{ marginLeft: '10px', padding: '10px', backgroundColor: '#e0e0e0' }}
            >
                Back to Courses
            </button>
        </div>
    );
};

export default CourseDetailPage;
