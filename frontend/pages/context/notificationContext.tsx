import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSocket } from '../../utils/socket';
import { toast } from 'react-toastify';

interface Notification {
    id: string;
    chatId: string;
    sender: string;
    content: string;
    timestamp: string;
}

interface NotificationContextProps {
    notifications: Notification[];
    addNotification: (notification: Notification) => void;
    removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        if (!userId) return;

        const socket = getSocket(userId);

        socket.emit('joinNotifications', { userId });
        console.log(`🔗 Joined notification room as user:${userId}`);

        socket.on('newNotification', (notification: Notification) => {
            console.log('🔔 New Notification:', notification);
            setNotifications((prev) => [...prev, { id: `${Date.now()}`, ...notification }]);
            toast.info(`💬 ${notification.content}`, {
                position: 'top-right',
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        });

        return () => {
            socket.off('newNotification');
        };
    }, []);

    const addNotification = (notification: Notification) => {
        setNotifications((prev) => [...prev, notification]);
    };

    const removeNotification = (id: string) => {
        setNotifications((prev) => prev.filter((notification) => notification.id !== id));
    };

    return (
        <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotificationContext = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotificationContext must be used within a NotificationProvider');
    }
    return context;
};
