import React, { useEffect, useState } from 'react';
import { useNotificationSocket } from './notifications/useNotificationSocket';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function MyApp({ Component, pageProps }) {
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
            setUserId(storedUserId);
        }
    }, []);

    useNotificationSocket(userId || '');

    return (
        <>
            <Component {...pageProps} />
            <ToastContainer />
        </>
    );
}

export default MyApp;
