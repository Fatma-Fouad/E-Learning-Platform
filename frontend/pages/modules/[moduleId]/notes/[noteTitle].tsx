import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const NoteDetailsPage = () => {
  const router = useRouter();
  const { moduleId, noteTitle } = router.query;

  const [note, setNote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  useEffect(() => {
    const fetchNoteDetails = async () => {
      if (!moduleId || !noteTitle) return;

      try {
        const response = await axios.get(
          `http://localhost:3000/notes/module/${moduleId}/notes/note-title/${encodeURIComponent(
            noteTitle as string
          )}`
        );
        setNote(response.data);
      } catch (err) {
        console.error('Error fetching note details:', err);
        setError('Failed to fetch note details');
      } finally {
        setLoading(false);
      }
    };

    fetchNoteDetails();
  }, [moduleId, noteTitle]);

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:3000/notes/title/${encodeURIComponent(noteTitle as string)}`);
      setDeleteSuccess(true);

      // Automatically redirect after 2 seconds
      setTimeout(() => {
        router.push(`/modules/${moduleId}/notes`);
      }, 2000);
    } catch (err) {
      console.error('Error deleting note:', err);
      setError('Failed to delete note');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h1>Note Details</h1>
      {note ? (
        <>
          <h2>{note.noteTitle}</h2>
          <p>
            <strong>Content:</strong> {note.content}
          </p>
          <p>
            <strong>Created At:</strong> {new Date(note.created_at).toLocaleString()}
          </p>
          <p>
            <strong>Last Updated:</strong> {new Date(note.last_updated).toLocaleString()}
          </p>
          <div style={{ marginTop: '20px' }}>
            <button onClick={() => router.push(`/modules/${moduleId}/notes`)}>Back to Notes</button>
            <button
              onClick={() => router.push(`/modules/${moduleId}/notes/${noteTitle}/update`)}
              style={{ marginLeft: '10px' }}
            >
              Update Note
            </button>
            <button
              onClick={handleDelete}
              style={{
                marginLeft: '10px',
                backgroundColor: '#ff4d4f',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                cursor: 'pointer',
              }}
            >
              Delete Note
            </button>
          </div>

          {/* Improved Delete Success Modal */}
          {deleteSuccess && (
            <div
              style={{
                position: 'fixed',
                top: '20%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: '#f6ffed',
                border: '1px solid #b7eb8f',
                borderRadius: '8px',
                padding: '20px 40px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                zIndex: 1000,
              }}
            >
              <h3 style={{ color: '#52c41a' }}>✅ Note Deleted Successfully!</h3>
              <p>Redirecting back to the notes list...</p>
            </div>
          )}
        </>
      ) : (
        <p>Note not found.</p>
      )}
    </div>
  );
};

export default NoteDetailsPage;
