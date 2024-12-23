import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const NotesPage = () => {
  const router = useRouter();
  const { moduleId } = router.query;

  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/notes/module/${moduleId}`);
        console.log('API Response:', response.data);

        if (Array.isArray(response.data.data)) {
          setNotes(response.data.data);
        } else {
          setNotes([]);
        }
      } catch (err) {
        console.error('Error fetching notes:', err);
        setError('Failed to load notes.');
      } finally {
        setLoading(false);
      }
    };

    if (moduleId) {
      fetchNotes();
    }
  }, [moduleId]);

  const handleNoteClick = (noteTitle: string) => {
    router.push(`/modules/${moduleId}/notes/note-title/${encodeURIComponent(noteTitle)}`);
  };

  const handleCreateNote = () => {
    router.push(`/modules/${moduleId}/notes/createnote`);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Notes for Module {moduleId}</h1>
      {notes.length > 0 ? (
        <>
          <button onClick={handleCreateNote}>Create Note</button>
          <ul>
            {notes.map((note: any) => (
              <li key={note._id || note.id}>
                <a
                  onClick={() => handleNoteClick(note.noteTitle)}
                  style={{ cursor: 'pointer', color: 'blue' }}
                >
                  {note.noteTitle}
                </a>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p>No notes available for this module.</p>
          <button onClick={handleCreateNote}>Create the First Note</button>
        </div>
      )}
    </div>
  );
};

export default NotesPage;
