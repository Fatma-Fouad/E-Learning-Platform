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
        if (Array.isArray(response.data)) {
          setNotes(response.data);
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Notes for Module {moduleId}</h1>
      <button onClick={() => router.push(`/modules/${moduleId}/notes/createnote`)}>Create Note</button>
      {Array.isArray(notes) && notes.length > 0 ? (
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
      ) : (
        <p>No notes available for this module.</p>
      )}
    </div>
  );
};

export default NotesPage;
