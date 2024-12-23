import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';


import { io, Socket } from 'socket.io-client';

const BASE_URL = 'http://localhost:3001';
let socket: Socket | null = null;

/**
 * Initializes and returns the Socket.IO instance
 */
export const getSocket = (userId: string): Socket => {
    if (!socket) {
        socket = io(BASE_URL, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
        });

        /** ✅ On successful connection */
        socket.on('connect', () => {
            console.log('✅ WebSocket connected:', socket?.id);
            if (userId) {
                socket.emit('joinNotifications', { userId });
                console.log(`🔗 joinNotifications emitted for userId: ${userId}`);
            }
        });

        /** ✅ On disconnection */
        socket.on('disconnect', (reason) => {
            console.warn('❌ WebSocket disconnected:', reason);
            if (reason === 'io server disconnect') {
                socket?.connect(); // Manually reconnect
            }
        });

        /** ✅ Handle Reconnection Logic */
        socket.on('connect_error', (error) => {
            console.error('❌ Connection error:', error.message);
        });

        socket.on('reconnect', (attemptNumber) => {
            console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
            if (userId) {
                socket.emit('joinNotifications', { userId });
                console.log(`🔗 Rejoined notification room after reconnect: user:${userId}`);
            }
        });

        socket.on('reconnect_attempt', () => {
            console.log('🔄 Reconnect attempt in progress...');
        });

        socket.on('reconnect_failed', () => {
            console.error('❌ Reconnect failed');
        });

        /** ✅ Ensure Global Listeners Are Set Once */
        setupGlobalListeners(socket);
    }

    return socket;
};

/**
 * Sets global event listeners for notifications
 */
const setupGlobalListeners = (socket: Socket) => {
    /** ✅ Listen for New Thread Notifications */
    socket.off('newThread').on('newThread', (payload) => {
        console.log('🔔 New Thread Notification:', payload);
        showNotification({
            title: '🧵 New Thread Created',
            message: payload.content,
            sender: payload.sender,
        });
    });

    /** ✅ Listen for New Reply Notifications */
    /** ✅ Listen for New Reply Notifications */
    socket.off('newReply').on('newReply', (payload) => {
        console.log('🔔 New Reply Notification:', payload);

        // Directly trigger a toast notification
        toast.info(
            `💬 ${payload.sender || 'System'}: ${payload.content}`,
            {
                position: 'top-right',
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
                style: {
                    backgroundColor: '#1e293b', // Dark background
                    color: '#f8fafc', // Light text
                    borderRadius: '8px',
                }
            }
        );
    });


    /** ✅ Listen for General Notifications */
    socket.off('newNotification').on('newNotification', (payload) => {
        console.log('🔔 New Notification Received:', payload);
        if (!payload || !payload.content || !payload.sender) {
            console.warn('⚠️ Invalid notification payload:', payload);
            return;
        }
        showNotification({
            title: '🔔 New Message Notification',
            message: payload.content,
            sender: payload.sender,
        });
    });

    /** ✅ Debug: Listen for Any Socket Event */
    socket.onAny((event, ...args) => {
        console.log(`📡 Event received: ${event}`, args);
    });

    /** ✅ Handle Errors */
    socket.on('error', (error) => {
        console.error('❌ Socket error:', error);
    });
};

/**
 * Handles displaying notifications in the frontend
 */
const showNotification = ({
    title,
    message,
    sender,
}: {
    title: string;
    message: string;
    sender: string;
}) => {
    // You can replace this with your Toast or Notification Popup logic
    if (window.Notification && Notification.permission === 'granted') {
        new Notification(title, {
            body: `${sender}: ${message}`,
        });
    } else {
        console.log(`${title}: ${sender}: ${message}`);
    }
};
