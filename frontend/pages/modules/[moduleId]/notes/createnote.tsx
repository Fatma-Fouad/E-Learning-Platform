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

  const userId = '6746676e0e44216ab25adb75'; // Replace dynamically if you have auth

  // Autosave function with debounce
  const autosaveNote = useCallback(async () => {
    if (!moduleId || !noteTitle.trim() || !content.trim()) return;

    try {
      setIsSaving(true);
      await axios.post('http://localhost:3000/notes', {
        user_id: userId,
        module_id: moduleId,
        noteTitle,
        content,
      });
    } catch (err) {
      console.error('Autosave failed:', err);
    } finally {
      setIsSaving(false);
    }
  }, [moduleId, noteTitle, content]);

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
      await axios.post('http://localhost:3000/notes', {
        user_id: userId,
        module_id: moduleId,
        noteTitle,
        content,
      });
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
    <div style={{ padding: '20px' }}>
      <h1>Create Note</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      {isSaving && <p style={{ color: 'orange' }}>Autosaving...</p>}

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
        disabled={isSaving}
        style={{
          marginTop: '10px',
          padding: '10px 15px',
          background: 'blue',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {isSaving ? 'Saving...' : 'Create Note'}
      </button>
    </div>
  );
};

export default CreateNotePage;
