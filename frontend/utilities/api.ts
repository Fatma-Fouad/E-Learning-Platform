import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/forums', // Adjust the URL based on your backend's API route
});

export default api;
