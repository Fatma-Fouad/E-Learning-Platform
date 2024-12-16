import { useState } from 'react';
import { createForum } from '../utils/api';

const AddForumPage = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const newForum = { title, description };
            await createForum(newForum);
            alert('Forum created successfully!');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div>
            <h1>Add Forum</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Title:</label>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div>
                    <label>Description:</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                </div>
                <button type="submit">Create</button>
                {error && <p>Error: {error}</p>}
            </form>
        </div>
    );
};

export default AddForumPage;
