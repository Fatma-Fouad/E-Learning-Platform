// components/ProfileCard.tsx

import React from 'react';

interface ProfileProps {
  profile: {
    name: string;
    email: string;
  };
}

const ProfileCard: React.FC<ProfileProps> = ({ profile }) => {
  return (
    <div
      style={{
        border: '1px solid #ccc',
        borderRadius: '5px',
        padding: '20px',
        backgroundColor: '#fff',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        maxWidth: '300px',
        textAlign: 'center',
      }}
    >
      <h3 style={{ marginBottom: '10px' }}>👤 {profile.name}</h3>
      <p style={{ margin: 0 }}>📧 {profile.email}</p>
    </div>
  );
};

export default ProfileCard;
