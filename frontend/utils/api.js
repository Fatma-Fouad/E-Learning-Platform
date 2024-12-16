const API_BASE_URL = 'http://localhost:3001'; // Backend URL

export const fetchForums = async () => {
    const response = await fetch(`${API_BASE_URL}/forums`);
    if (!response.ok) {
        throw new Error('Failed to fetch forums');
    }
    return response.json();
};

export const fetchForumsByCourse = async (courseId) => {
    const response = await fetch(`http://localhost:3001/forums/course/${courseId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch forums for the course');
    }
    return response.json();
};

export const searchCourses = async (query) => {
    const response = await fetch(`http://localhost:3001/forums/search-courses?q=${query}`);
    if (!response.ok) {
        throw new Error('Failed to search courses');
    }
    return response.json();
};

export const searchForums = async (query) => {
    const response = await fetch(`http://localhost:3001/forums/search?q=${query}`);
    if (!response.ok) {
        throw new Error('Failed to search forums');
    }
    return response.json();
};

export const searchThreadsInCourse = async (courseId, query) => {
    const response = await fetch(`http://localhost:3001/forums/${courseId}/search-threads?q=${query}`);
    if (!response.ok) {
        throw new Error('Failed to search threads in the course');
    }
    return response.json();
};



export const createForum = async (data) => {
    const response = await fetch(`${API_BASE_URL}/forums`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error('Failed to create forum');
    }
    return response.json();
};
