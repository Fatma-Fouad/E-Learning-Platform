import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const UpdateNotePage = () => {
  const router = useRouter();
  const { moduleId, noteTitle } = router.query;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch current note details
  useEffect(() => {
    const fetchNoteDetails = async () => {
      if (!moduleId || !noteTitle) return;

      try {
        const response = await axios.get(
          `http://localhost:3000/notes/module/${moduleId}/notes/note-title/${encodeURIComponent(
            noteTitle as string
          )}`
        );

        const note = response.data;
        setTitle(note.noteTitle);
        setContent(note.content);
      } catch (err) {
        console.error('Error fetching note details:', err);
        setError('Failed to fetch note details');
      } finally {
        setLoading(false);
      }
    };

    fetchNoteDetails();
  }, [moduleId, noteTitle]);

  // Handle update note
  const handleUpdate = async () => {
    try {
      const response = await axios.put(
        `http://localhost:3000/notes/module/${moduleId}/title/${encodeURIComponent(
          noteTitle as string
        )}`,
        {
          noteTitle: title,
          content,
        }
      );

      console.log('✅ Note updated:', response.data);
      router.push(`/modules/${moduleId}/notes`);
    } catch (err) {
      console.error('❌ Error updating note:', err);
      setError('Failed to update note');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h1>Update Note</h1>

      <label>
        <strong>Note Title:</strong>
      </label>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter note title"
        style={{ width: '100%', marginBottom: '10px' }}
      />

      <label>
        <strong>Content:</strong>
      </label>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Enter note content"
        rows={5}
        style={{ width: '100%', marginBottom: '10px' }}
      />

      <div style={{ marginTop: '20px' }}>
        <button onClick={handleUpdate}>Save Changes</button>
        <button onClick={() => router.push(`/modules/${moduleId}/notes`)} style={{ marginLeft: '10px' }}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default UpdateNotePage;
