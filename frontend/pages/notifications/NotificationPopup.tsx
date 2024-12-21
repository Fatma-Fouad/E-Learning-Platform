import React from 'react';
import { useNotificationContext } from '../context/notificationContext';

const NotificationPopup = () => {
    const { notifications, removeNotification } = useNotificationContext();

    return (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    style={{
                        background: '#fff',
                        border: '1px solid #ccc',
                        borderRadius: '5px',
                        padding: '10px',
                        marginBottom: '10px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    }}
                >
                    <p>
                        <strong>From:</strong> {notification.sender}
                    </p>
                    <p>{notification.content}</p>
                    <button onClick={() => removeNotification(notification.id)}>Dismiss</button>
                </div>
            ))}
        </div>
    );
};

export default NotificationPopup;
