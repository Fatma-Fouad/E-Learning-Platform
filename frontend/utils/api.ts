const BASE_URL = 'http://localhost:3001';

// Fetch all available courses
export const fetchCourses = async (): Promise<{ _id: string; title: string }[]> => {
    const response = await fetch(`${BASE_URL}/courses/available-courses`);
    if (!response.ok) {
        throw new Error('Failed to fetch courses');
    }
    return response.json();
};

// Search courses by keyword
export const searchCoursesByKeyword = async (keyword: string) => {
    if (!keyword || keyword.trim() === '') {
        throw new Error('Search keyword cannot be empty.');
    }

    const response = await fetch(
        `http://localhost:3001/courses/search-by-keyword?keyword=${encodeURIComponent(keyword)}`
    );

    if (!response.ok) {
        throw new Error('Failed to search courses');
    }

    const result = await response.json();
    return result.courses; // Return the "courses" array
};



export const searchThreadsInCourse = async (courseId: string, searchTerm: string) => {
    const response = await fetch(
        `${BASE_URL}/forums/${courseId}/search-threads?q=${encodeURIComponent(searchTerm)}`
    );
    if (!response.ok) {
        throw new Error('Failed to search threads in course.');
    }
    return response.json();
};




export const fetchCourseById = async (id: string, userId?: string) => {
    try {
        if (!id) throw new Error('Course ID is required');

        const url = new URL(`${BASE_URL}/courses/${id}`);
        if (userId) {
            url.searchParams.append('userId', userId);
        }

        console.log('🔗 Fetching course from:', url.toString());

        const response = await fetch(url.toString());

        if (!response.ok) {
            const errorDetails = await response.text();
            throw new Error(`Failed to fetch course details: ${response.status} - ${errorDetails}`);
        }

        return await response.json();
    } catch (error: any) {
        console.error('❌ Error fetching course details:', error.message);
        throw new Error(`Unable to fetch course details: ${error.message}`);
    }
};



export const fetchForumsByCourse = async (courseId: string, userId: string) => {
    try {
        if (!courseId || !userId) {
            throw new Error('Both courseId and userId are required');
        }

        const url = new URL(`${BASE_URL}/forums/course/${courseId}`);
        url.searchParams.append('userId', userId);

        console.log('🔗 Fetching forums from:', url.toString());

        const response = await fetch(url.toString());

        if (!response.ok) {
            const errorDetails = await response.text();
            throw new Error(`Failed to fetch forums: ${response.status} - ${errorDetails}`);
        }

        return await response.json();
    } catch (error: any) {
        console.error('❌ Error fetching forums:', error.message);
        throw new Error(`Unable to fetch forums: ${error.message}`);
    }
};


export const addThread = async (courseId: string, title: string, description: string, createdBy: string) => {
    const response = await fetch(`http://localhost:3001/forums/${courseId}/threads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, createdBy }),
    });
    if (!response.ok) throw new Error('Failed to add thread');
    return response.json();
};

export const addReply = async (courseId: string, threadId: string, userId: string, message: string) => {
    console.log('API call - courseId:', courseId);
    console.log('API call - threadId:', threadId);
    console.log('API call - userId:', userId);
    console.log('API call - message:', message);

    const response = await fetch(`${BASE_URL}/forums/${courseId}/threads/${threadId}/replies`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, message }),
    });

    console.log('API response:', response.status, response.statusText);

    if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error('Failed to add reply');
    }

    return response.json();
};

export const editThread = async (
    courseId: string,
    threadId: string,
    userId: string,
    updateData: { title?: string; description?: string }
) => {
    const response = await fetch(`${BASE_URL}/forums/${courseId}/threads/${threadId}?userId=${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
    });
    if (!response.ok) throw new Error('Failed to edit thread');
    return response.json();
};


export const deleteThread = async (courseId: string, threadId: string, userId: string) => {
    const response = await fetch(
        `${BASE_URL}/forums/${courseId}/threads/${threadId}?userId=${userId}`,
        {
            method: 'DELETE',
        }
    );
    if (!response.ok) {
        throw new Error('Failed to delete thread');
    }
    return response.json();
};

export const deleteReply = async (
    courseId: string,
    threadId: string,
    replyId: string,
    userId: string
) => {
    const response = await fetch(
        `${BASE_URL}/forums/${courseId}/threads/${threadId}/replies/${replyId}?userId=${userId}`,
        {
            method: 'DELETE',
        }
    );
    if (!response.ok) {
        throw new Error('Failed to delete reply');
    }
    return response.json();
};

export const addForum = async (courseId: string, courseName: string, createdBy: string) => {
    const response = await fetch(`${BASE_URL}/forums/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, courseName, createdBy }),
    });
    if (!response.ok) throw new Error('Failed to create forum');
    return response.json();
};

export const deleteForum = async (forumId: string, userId: string) => {
    const response = await fetch(`${BASE_URL}/forums/${forumId}?userId=${userId}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete forum');
    return response.json();
};


//chats
export const createChat = async (type, payload) => {
    try {
        console.log("Sending Payload:", payload);
        const response = await fetch(`http://localhost:3001/chat/${type}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error("API Error:", error);
            throw new Error(error.message || "Failed to create chat");
        }

        return response.json();
    } catch (error) {
        console.error("Error in createChat API call:", error.message);
        throw error;
    }
};


export const fetchChatMessages = async (courseId: string) => {
    const response = await fetch(`http://localhost:3001/chat/${courseId}`);
    if (!response.ok) throw new Error('Failed to fetch chat messages');
    return response.json();
};

export const sendChatMessage = async (courseId: string, message: string) => {
    const response = await fetch(`http://localhost:3001/chat/${courseId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
    });
    if (!response.ok) throw new Error('Failed to send message');
    return response.json();
};
export const fetchChatsByCourse = async (courseId: string, userId: string) => {
    try {
        console.log('Fetching chats with:', {
            courseId,
            userId,
            endpoint: `http://localhost:3001/chat/course/${courseId}?userId=${userId}`,
        });

        const response = await fetch(
            `http://localhost:3001/chat/course/${courseId}?userId=${userId}`
        );

        if (!response.ok) {
            console.error('Fetch failed:', response.status, response.statusText);
            const errorDetails = await response.json();
            console.error('Error details from backend:', errorDetails);
            throw new Error('Failed to fetch chats');
        }

        return await response.json();
    } catch (error) {
        console.error('Error in fetchChatsByCourse:', error.message);
        throw error;
    }
};




export const fetchChatHistory = async (chatId: string) => {
    const response = await fetch(`http://localhost:3001/chat/${chatId}/messages`);
    if (!response.ok) throw new Error('Failed to fetch chat history');
    return response.json();
};

export const addMessageToChat = async (chatId: string, payload: { sender: string; content: string }) => {
    const response = await fetch(`http://localhost:3001/chat/message/${chatId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const error = await response.json();
        console.error('Server Error:', error); // Log server error
        throw new Error('Failed to add message to the chat');
    }

    return response.json();
};


