import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const NoteDetailsPage = () => {
  const router = useRouter();
  const { moduleId, noteTitle } = router.query; // Extract moduleId and noteTitle from the URL

  const [note, setNote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNoteByTitle = async () => {
      if (!moduleId || !noteTitle) return;

      try {
        console.log(`Fetching note details: moduleId=${moduleId}, noteTitle=${noteTitle}`);
        const response = await axios.get(
          `http://localhost:3000/notes/module/${moduleId}/notes/note-title/${encodeURIComponent(
            noteTitle as string
          )}`
        );
        setNote(response.data);
      } catch (err) {
        console.error('Error fetching note details:', err);
        setError('Failed to load note details.');
      } finally {
        setLoading(false);
      }
    };

    fetchNoteByTitle();
  }, [moduleId, noteTitle]);

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:3000/notes/title/${encodeURIComponent(noteTitle as string)}`);
      alert('Note deleted successfully!');
      router.push(`/modules/${moduleId}/notes`);
    } catch (err) {
      console.error('Error deleting note:', err);
      setError('Failed to delete note.');
    }
  };

  const handleUpdateRedirect = () => {
    router.push(`/modules/${moduleId}/notes/${encodeURIComponent(noteTitle as string)}/update`);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Note Details</h1>
      {note ? (
        <>
          <h2>{note.noteTitle}</h2>
          <p><strong>Content:</strong> {note.content}</p>
          <p><strong>Created At:</strong> {new Date(note.created_at).toLocaleString()}</p>
          <p><strong>Last Updated:</strong> {new Date(note.last_updated).toLocaleString()}</p>
          <button onClick={() => router.push(`/modules/${moduleId}/notes`)} style={{ marginRight: '10px' }}>
            Back to Notes
          </button>
          <button onClick={handleUpdateRedirect} style={{ marginRight: '10px' }}>
            Update Note
          </button>
          <button onClick={handleDelete} style={{ color: 'red' }}>
            Delete Note
          </button>
        </>
      ) : (
        <p>Note not found.</p>
      )}
    </div>
  );
};

export default NoteDetailsPage;
