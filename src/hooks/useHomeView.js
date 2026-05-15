import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJoinByPin } from '@/hooks/useJoinByPin';
import { ROUTE_PATHS } from '@/router/paths';

export function useHomeView() {
    const navigate = useNavigate();
    const { join, loading, error, clearError } = useJoinByPin();
    const [pin, setPin] = useState('');
    const [mouse, setMouse] = useState({ x: 0, y: 0 });
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => setReady(true), 80);
        const handleMouseMove = (event) => setMouse({
            x: event.clientX / window.innerWidth - 0.5,
            y: event.clientY / window.innerHeight - 0.5,
        });

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.clearTimeout(timeoutId);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    const getParallaxStyle = (depth) => ({
        transform: `translate(${mouse.x * depth * 300}px, ${mouse.y * depth * 300}px)`,
        transition: 'transform 0.14s linear',
    });

    const handlePinSubmit = async (event) => {
        event.preventDefault();
        await join({ pin });
    };

    const handlePinChange = (value) => {
        clearError();
        setPin(value.replace(/\D/g, '').slice(0, 6));
    };

    return {
        pin,
        loading,
        error,
        ready,
        getParallaxStyle,
        handlePinSubmit,
        handlePinChange,
        goToLogin: () => navigate(ROUTE_PATHS.login),
        goToRegister: () => navigate(ROUTE_PATHS.register),
    };
}