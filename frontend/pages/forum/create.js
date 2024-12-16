import { useState } from 'react';
import api from '../../utilities/api';
import { useRouter } from 'next/router';

export default function CreateForum() {
    const [formData, setFormData] = useState({ courseId: '', courseName: '', createdBy: '' });
    const [error, setError] = useState('');
    const router = useRouter();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/forums/create', formData);
            router.push('/forums'); // Redirect to forums page
        } catch (error) {
            setError('Error creating forum. Please try again.');
            console.error(error.message);
        }
    };
  

    return (
        <div>
            <h1>Create Forum</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <label>Course ID:</label>
                <input type="text" name="courseId" value={formData.courseId} onChange={handleInputChange} required />
                <label>Course Name:</label>
                <input type="text" name="courseName" value={formData.courseName} onChange={handleInputChange} required />
                <label>Created By:</label>
                <input type="text" name="createdBy" value={formData.createdBy} onChange={handleInputChange} required />
                <button type="submit">Create Forum</button>
            </form>
        </div>
    );
}
