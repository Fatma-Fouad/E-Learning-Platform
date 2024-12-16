// utils/api.js
export const fetchForums = async () => {
    const response = await fetch('http://localhost:3001/forums');
    if (!response.ok) {
        throw new Error('Failed to fetch forums');
    }
    return response.json();
};
