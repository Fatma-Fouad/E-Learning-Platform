import React, { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const CreateNotePage = () => {
  const router = useRouter();
  const { moduleId } = router.query; // Retrieve module ID from the URL

  const [noteTitle, setNoteTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCreateNote = async () => {
    // Validate fields
    if (!moduleId) {
      setError('Module ID is missing!');
      return;
    }

    if (!noteTitle.trim() || !content.trim()) {
      setError('Both title and content are required.');
      return;
    }

    try {
      const userId = '6746676e0e44216ab25adb75'; // Temporary hardcoded user ID (Replace dynamically if you have auth)

      const payload = {
        user_id: userId,
        module_id: moduleId,
        noteTitle,
        content,
      };

      console.log('Sending payload:', payload);

      const response = await axios.post('http://localhost:3000/notes', payload);

      console.log('Note created:', response.data);
      setSuccess('Note successfully created!');

      // Redirect back to the notes page after a short delay
      setTimeout(() => {
        router.push(`/modules/${moduleId}/notes`);
      }, 1000);
    } catch (err: any) {
      console.error('Error creating note:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to create note. Please try again.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Create Note</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <div style={{ marginBottom: '10px' }}>
        <label>Note Title:</label>
        <input
          type="text"
          value={noteTitle}
          onChange={(e) => setNoteTitle(e.target.value)}
          placeholder="Enter note title"
          style={{
            display: 'block',
            marginTop: '5px',
            padding: '5px',
            width: '100%',
          }}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label>Content:</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter note content"
          style={{
            display: 'block',
            marginTop: '5px',
            padding: '5px',
            width: '100%',
            height: '100px',
          }}
        />
      </div>

      <button
        onClick={handleCreateNote}
        style={{
          marginTop: '10px',
          padding: '10px 15px',
          background: 'blue',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Create Note
      </button>
    </div>
  );
};

export default CreateNotePage;
