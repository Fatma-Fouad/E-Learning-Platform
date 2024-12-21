import { useEffect } from 'react';
import { getSocket } from '../../utils/socket';
import { toast } from 'react-toastify';

interface Notification {
    chatId: string;
    sender: string;
    content: string;
    timestamp: string;
}

export const useNotificationSocket = (userId: string) => {
    useEffect(() => {
        if (!userId) return;

        const socket = getSocket(userId);

        // ✅ Join Notification Room
        socket.emit('joinNotifications', { userId });
        console.log(`🔗 User joined notification room: user:${userId}`);

        // ✅ Listen for Notifications
        // ✅ Ensure Listener Runs Once
        const handleNewNotification = (notification: any) => {
            console.log('🔔 New Notification Received:', notification);

            toast.info(`💬 New Message from ${notification.sender}: ${notification.content}`, {
                position: 'top-right',
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        };
        // ✅ Prevent Duplicate Listeners
        socket.off('newNotification'); // Remove existing listener
        socket.on('newNotification', handleNewNotification);
        socket.on('connect', () => {
            console.log('✅ Connected to notification server');
        });

        socket.on('disconnect', () => {
            console.warn('❌ Disconnected from notification server');
        });

        return () => {
            socket.off('newNotification', handleNewNotification); // Cleanup on unmount
            socket.off('connect');
            socket.off('disconnect');
            socket.disconnect();
        };
    }, [userId]);
};
