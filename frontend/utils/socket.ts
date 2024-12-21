import { io, Socket } from 'socket.io-client';

const BASE_URL = 'http://localhost:3001';
let socket: Socket | null = null;

export const getSocket = (userId: string): Socket => {
    if (!socket) {
        socket = io(BASE_URL, {
            transports: ['websocket'],
        });

        socket.on('connect', () => {
            console.log('✅ WebSocket connected:', socket?.id);
            if (userId) {
                socket.emit('joinNotifications', { userId });
                console.log(`🔗 joinNotifications emitted for userId: ${userId}`);
            }
        });

        socket.on('disconnect', () => {
            console.warn('❌ WebSocket disconnected');
        });
    }
    return socket;
};
