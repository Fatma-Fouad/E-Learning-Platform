// components/CourseList.tsx

import React from 'react';

interface Course {
  id: string;
  title: string;
  status?: string; // Ensure 'status' is optional if not all courses will have it
}

interface CourseListProps {
  courses: Course[];
  onCourseClick?: (courseId: string) => void;
}

const CourseList: React.FC<CourseListProps> = ({ courses, onCourseClick }) => {
  if (!courses || courses.length === 0) {
    return <p>No courses available.</p>;
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {courses.map((course) => (
        <li
          key={course.id}
          style={{
            border: '1px solid #ccc',
            padding: '10px',
            margin: '10px 0',
            borderRadius: '5px',
            cursor: onCourseClick ? 'pointer' : 'default',
            backgroundColor: '#f9f9f9',
            transition: 'background-color 0.2s ease-in-out',
          }}
          onClick={() => onCourseClick && onCourseClick(course.id)}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e6f7ff')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f9f9f9')}
        >
          <h4 style={{ margin: '0 0 5px' }}>{course.title}</h4>
          {course.status && (
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#555' }}>
              Status: {course.status}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
};

export default CourseList;
