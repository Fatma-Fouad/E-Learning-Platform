import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const UpdateNotePage = () => {
  const router = useRouter();
  const { moduleId, noteTitle } = router.query;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isManualSave, setIsManualSave] = useState(false);

  // Fetch Note Details on Load
  useEffect(() => {
    const fetchNote = async () => {
      if (!moduleId || !noteTitle) return;
      try {
        const token = localStorage.getItem('token'); // Retrieve the token from localStorage

        const response = await axios.get(
          `http://localhost:3000/notes/module/${moduleId}/notes/note-title/${encodeURIComponent(
            noteTitle as string
          )}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include the token in the Authorization header
            },
          }
        );
        setTitle(response.data.noteTitle);
        setContent(response.data.content);
      } catch (err) {
        console.error('Error fetching note details:', err);
        setError('Failed to load note details.');
      }
    };

    fetchNote();
  }, [moduleId, noteTitle]);

  // ✅ Autosave Function
  const autosaveNote = useCallback(async () => {
    if (!moduleId || !noteTitle || !content.trim()) return;

    try {
      const token = localStorage.getItem('token'); // Retrieve the token from localStorage
      setIsSaving(true);
      await axios.put(
        `http://localhost:3000/notes/module/${moduleId}/title/${encodeURIComponent(
          noteTitle as string
        )}`,
        {
          noteTitle: title,
          content,
          isAutoSaved: true, // Indicate autosave
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
        }
      );
      setIsSaving(false);
      console.log('✅ Autosave successful');
    } catch (err) {
      console.error('Autosave failed:', err);
      setError('Autosave failed. Please check your connection.');
      setIsSaving(false);
    }
  }, [moduleId, noteTitle, title, content]);

  // ✅ Debounce Autosave
  useEffect(() => {
    const autosaveTimer = setTimeout(() => {
      if (!isManualSave) {
        autosaveNote();
      }
    }, 5000); // Autosave every 5 seconds

    return () => clearTimeout(autosaveTimer);
  }, [autosaveNote, isManualSave]);

  // ✅ Manual Save
  const handleUpdate = async () => {
    setIsManualSave(true);
    if (!title.trim()) {
      setError('Note Title cannot be empty.');
      return;
    }
    if (!content.trim()) {
      setError('Content cannot be empty.');
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token'); // Retrieve the token from localStorage
      await axios.put(
        `http://localhost:3000/notes/module/${moduleId}/title/${encodeURIComponent(
          noteTitle as string
        )}`,
        {
          noteTitle: title,
          content,
          isAutoSaved: false, // Manual save
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
        }
      );

      setSuccess('✅ Note updated successfully!');
      setTimeout(() => {
        router.push(`/modules/${moduleId}/notes`);
      }, 1000);
    } catch (err) {
      console.error('Error updating note:', err);
      setError('Failed to update the note. Please try again.');
    } finally {
      setIsSaving(false);
      setIsManualSave(false);
    }
  };

  // ✅ Component JSX
  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>Update Note</h1>
      {error && <p style={errorStyle}>{error}</p>}
      {success && <p style={successStyle}>{success}</p>}
      {isSaving && <p style={{ color: 'orange', textAlign: 'center' }}>Autosaving...</p>}

      <div style={formGroupStyle}>
        <label style={labelStyle}>Note Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={autosaveNote}
          placeholder="Enter note title"
          style={inputStyle}
        />
      </div>

      <div style={formGroupStyle}>
        <label style={labelStyle}>Content:</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={autosaveNote}
          placeholder="Enter note content"
          style={textareaStyle}
        />
      </div>

      <button onClick={handleUpdate} style={buttonStyle} disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Update Note'}
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

const headerStyle: React.CSSProperties = {
  fontSize: '24px',
  marginBottom: '20px',
  textAlign: 'center',
  color: '#333',
};

const formGroupStyle: React.CSSProperties = {
  marginBottom: '15px',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontWeight: 'bold',
  marginBottom: '5px',
  color: '#555',
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
  textAlign: 'center',
};

const successStyle: React.CSSProperties = {
  color: 'green',
  fontSize: '14px',
  marginBottom: '10px',
  textAlign: 'center',
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

export default UpdateNotePage;
