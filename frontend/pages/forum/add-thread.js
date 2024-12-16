import { useState } from 'react';
import api from '../../../utilities/api';
import { useRouter } from 'next/router';

export default function AddThread({ courseId }) {
    const [threadData, setThreadData] = useState({ title: '', description: '', createdBy: '' });
    const router = useRouter();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setThreadData({ ...threadData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/forums/${courseId}/threads', threadData);
            router.push('/forums/${courseId}'); // Redirect to course page
        } catch (error) {
            console.error('Error adding thread:', error.message);
        }
    };

    return (
        <div>
            <h1>Add Thread</h1>
            <form onSubmit={handleSubmit}>
                <label>Title:</label>
                <input type="text" name="title" value={threadData.title} onChange={handleInputChange} required />
                <label>Description:</label>
                <textarea name="description" value={threadData.description} onChange={handleInputChange} required />
                <label>Created By:</label>
                <input type="text" name="createdBy" value={threadData.createdBy} onChange={handleInputChange} required />
                <button type="submit">Add Thread</button>
            </form>
        </div>
    );
}

AddThread.getInitialProps = async ({ query }) => {
    return { courseId: query.courseId };
};
