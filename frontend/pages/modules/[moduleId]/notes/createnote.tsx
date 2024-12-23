import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const CreateNotePage = () => {
  const router = useRouter();
  const { moduleId } = router.query;

  const [noteTitle, setNoteTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Retrieve token and userId from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

  // Redirect to login if token or userId is missing
  useEffect(() => {
    if (!token || !userId) {
      setError('Unauthorized access. Redirecting to login...');
      router.push('/login');
    }
  }, [token, userId, router]);

  // Autosave function with debounce
  const autosaveNote = useCallback(async () => {
    if (!moduleId || !noteTitle.trim() || !content.trim() || !token || !userId) return;

    try {
      setIsSaving(true);
      await axios.post(
        'http://localhost:3000/notes',
        {
          user_id: userId,
          module_id: moduleId,
          noteTitle,
          content,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Autosave successful');
    } catch (err) {
      console.error('Autosave failed:', err);
    } finally {
      setIsSaving(false);
    }
  }, [moduleId, noteTitle, content, token, userId]);

  // Debounce for autosave
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      autosaveNote();
    }, 3000); // Autosave every 3 seconds

    return () => clearTimeout(debounceTimer);
  }, [autosaveNote]);

  // Manual save
  const handleCreateNote = async () => {
    if (!moduleId || !noteTitle.trim() || !content.trim()) {
      setError('Both title and content are required.');
      return;
    }

    try {
      setIsSaving(true);
      await axios.post(
        'http://localhost:3000/notes',
        {
          user_id: userId,
          module_id: moduleId,
          noteTitle,
          content,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess('Note successfully created!');
      setTimeout(() => {
        router.push(`/modules/${moduleId}/notes`);
      }, 1000);
    } catch (err) {
      console.error('Error creating note:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to create note. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={containerStyle}>
      <h1>Create Note</h1>
      {error && <p style={errorStyle}>{error}</p>}
      {success && <p style={successStyle}>{success}</p>}
      {isSaving && <p style={savingStyle}>Autosaving...</p>}

      <div style={formGroupStyle}>
        <label>Note Title:</label>
        <input
          type="text"
          value={noteTitle}
          onChange={(e) => setNoteTitle(e.target.value)}
          placeholder="Enter note title"
          style={inputStyle}
        />
      </div>

      <div style={formGroupStyle}>
        <label>Content:</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter note content"
          style={textareaStyle}
        />
      </div>

      <button
        onClick={handleCreateNote}
        disabled={isSaving}
        style={buttonStyle}
      >
        {isSaving ? 'Saving...' : 'Create Note'}
      </button>
    </div>
  );
};

// ✅ Styles
const containerStyle: React.CSSProperties = {
  padding: '20px',
  maxWidth: '600px',
  margin: '50px auto',
  background: '#f9f9f9',
  border: '1px solid #ddd',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  fontFamily: 'Arial, sans-serif',
};

const formGroupStyle: React.CSSProperties = {
  marginBottom: '15px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px',
  fontSize: '14px',
  borderRadius: '4px',
  border: '1px solid #ccc',
  marginBottom: '10px',
};

const textareaStyle: React.CSSProperties = {
  width: '100%',
  height: '120px',
  padding: '8px',
  fontSize: '14px',
  borderRadius: '4px',
  border: '1px solid #ccc',
  resize: 'none',
};

const errorStyle: React.CSSProperties = {
  color: 'red',
  fontSize: '14px',
  marginBottom: '10px',
  textAlign: 'center' as const,
};

const successStyle: React.CSSProperties = {
  color: 'green',
  fontSize: '14px',
  marginBottom: '10px',
  textAlign: 'center' as const,
};

const savingStyle: React.CSSProperties = {
  color: 'orange',
  fontSize: '14px',
  marginBottom: '10px',
  textAlign: 'center' as const,
};

const buttonStyle: React.CSSProperties = {
  marginTop: '10px',
  padding: '10px 15px',
  background: 'blue',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  display: 'block',
  width: '100%',
  fontSize: '14px',
};

export default CreateNotePage;
