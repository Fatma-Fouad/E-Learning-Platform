import { useEffect } from 'react';
import { getSocket } from '../../utils/socket';
import { toast } from 'react-toastify';

export const useNotificationSocket = (userId: string) => {
    useEffect(() => {
        if (!userId) return;

        const socket = getSocket(userId);

        // ✅ Join Notification Room
        socket.emit('joinNotifications', { userId });
        console.log(`🔗 User explicitly joined notification room: user:${userId}`);

        // ✅ Listen for newNotification
        const handleNewNotification = (notification: any) => {
            console.log('🔔 New Notification Received:', notification);

            if (!notification || !notification.content || !notification.sender) {
                console.warn('⚠️ Invalid notification received:', notification);
                return;
            }

            toast.info(`💬 New Message from ${notification.sender}: ${notification.content}`, {
                position: 'top-right',
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        };

        socket.off('newNotification').on('newNotification', handleNewNotification);

        socket.on('connect', () => {
            console.log('✅ Connected to notification server');
            socket.emit('joinNotifications', { userId });
        });

        socket.on('disconnect', () => {
            console.warn('❌ Disconnected from notification server');
        });

        return () => {
            socket.off('newNotification', handleNewNotification);
            socket.off('connect');
            socket.off('disconnect');
            console.log('🧹 Cleaned up socket listeners');
        };
    }, [userId]);
};
