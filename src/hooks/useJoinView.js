import { useState } from 'react';
import { useJoinByPin } from '@/hooks/useJoinByPin';

export function useJoinView() {
    const [pin, setPin] = useState('');
    const [playerName, setPlayerName] = useState(localStorage.getItem('player_name') || '');
    const { join, loading, error, clearError } = useJoinByPin();

    const handleSubmit = async (event) => {
        event.preventDefault();
        await join({ pin, playerName });
    };

    return {
        pin,
        playerName,
        loading,
        error,
        handleSubmit,
        handlePinChange: (value) => {
            clearError();
            setPin(value.replace(/\D/g, '').slice(0, 6));
        },
        handlePlayerNameChange: (value) => {
            clearError();
            setPlayerName(value);
        },
    };
}