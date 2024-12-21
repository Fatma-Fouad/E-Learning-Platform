import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const UploadMedia = () => {
  const router = useRouter();
  const { moduleId } = router.query; // Get moduleId from the URL
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [uploadedFilePath, setUploadedFilePath] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setError('');
    setMessage('');
    setUploadedFilePath(null);

    try {
      const response = await axios.patch(
        `http://localhost:3000/modules/${moduleId}/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setMessage(response.data.message);
      setUploadedFilePath(response.data.filePath); // Set the file path
      setFile(null); // Clear the selected file
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Failed to upload the file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h1>Upload Media</h1>
      <p>Module ID: {moduleId}</p>
      <input type="file" accept=".pdf,video/mp4" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {uploadedFilePath && (
        <p>
          File uploaded successfully. Access it here: {' '}
          <a
            href={`http://localhost:3000/${uploadedFilePath.replace('\\', '/')}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {uploadedFilePath.split('\\').pop()}
          </a>
        </p>
      )}
      <button onClick={() => router.push(`/modules/${moduleId}`)}>Back to Module</button>
    </div>
  );
};

export default UploadMedia;
