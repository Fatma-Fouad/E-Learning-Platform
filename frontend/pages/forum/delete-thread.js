import { useRouter } from 'next/router';
import api from '../utilities/api';

export default function DeleteThreadButton({ courseId, threadId }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this thread?')) return;

    try {
      await api.delete(`/forums/${courseId}/threads/${threadId}`);
      router.reload(); // Reload the page to reflect the changes
    } catch (error) {
      console.error('Error deleting thread:', error.message);
    }
  };

  return <button onClick={handleDelete}>Delete Thread</button>;
}
