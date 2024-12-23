import { useEffect } from 'react';
import { getSocket } from '../../utils/socket';
import { toast } from 'react-toastify';

interface Notification {
    content: string;
    sender?: string; // Optional field in case sender is not provided
    type: string;
    courseId?: string;
    timestamp?: string;
}

export const useNotificationSocket = (userId: string) => {
    useEffect(() => {
        if (!userId) {
            console.warn('⚠️ User ID is missing. Cannot join notification room.');
            return;
        }

        const socket = getSocket(userId);

        // ✅ Join Notification Room
        socket.emit('joinNotifications', { userId });
        console.log(`🔗 User explicitly joined notification room: user:${userId}`);

        // ✅ Handle New Notification
        const handleNewNotification = (notification: Notification) => {
            console.log('🔔 New Notification Received:', notification);

            // Validate Notification Object
            if (!notification || !notification.content) {
                console.warn('⚠️ Invalid notification received:', notification);
                return;
            }

            // ✅ Display Toast Notification
            toast.info(
                notification.sender
                    ? `📢 ${notification.sender}: ${notification.content}`
                    : `📢 Notification: ${notification.content}`,
                {
                    position: 'top-right',
                    autoClose: false,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: 'dark',
                    style: {
                        backgroundColor: '#1e293b', // Dark background
                        color: '#f8fafc', // Light text
                        border: '1px solidrgb(102, 114, 135)', // Blue border
                        borderRadius: '8px',
                    }
                }
            );
        };

        // ✅ Set Up Event Listeners
        socket.off('newNotification').on('newNotification', handleNewNotification);

        socket.on('connect', () => {
            console.log('✅ Connected to notification server');
            socket.emit('joinNotifications', { userId });
        });

        socket.on('disconnect', () => {
            console.warn('❌ Disconnected from notification server');
        });

        // ✅ Cleanup Listeners on Unmount
        return () => {
            socket.off('newNotification', handleNewNotification);
            socket.off('connect');
            socket.off('disconnect');
            console.log('🧹 Cleaned up socket listeners');
        };
    }, [userId]);
};
