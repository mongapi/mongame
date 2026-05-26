import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/router/paths';

export function useHomeView() {
    const navigate = useNavigate();
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

    const handlePinSubmit = (event) => {
        event.preventDefault();
        navigate(`${ROUTE_PATHS.join}?pin=${pin}`);
    };

    const handlePinChange = (value) => {
        setPin(value.replace(/\D/g, '').slice(0, 6));
    };

    return {
        pin,
        ready,
        getParallaxStyle,
        handlePinSubmit,
        handlePinChange,
        goToLogin: () => navigate(ROUTE_PATHS.login),
        goToRegister: () => navigate(ROUTE_PATHS.register),
    };
}