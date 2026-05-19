import { useEffect, useState } from 'react';
import { adminAPI } from '@/api/api';

const EMPTY_METRICS = {
    total: 0,
    admins: 0,
    teachers: 0,
    students: 0,
    new_last_7_days: 0,
};

function buildMetrics(users) {
    const lastWeek = Date.now() - (7 * 24 * 60 * 60 * 1000);

    return {
        total: users.length,
        admins: users.filter((user) => user.role === 'admin').length,
        teachers: users.filter((user) => user.role === 'teacher').length,
        students: users.filter((user) => user.role === 'student').length,
        new_last_7_days: users.filter((user) => user.created_at && new Date(user.created_at).getTime() >= lastWeek).length,
    };
}

export function useAdminUsersView() {
    const [users, setUsers] = useState([]);
    const [metrics, setMetrics] = useState(EMPTY_METRICS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pendingUserId, setPendingUserId] = useState(null);

    useEffect(() => {
        let mounted = true;

        async function load() {
            const result = await adminAPI.users();

            if (!mounted) {
                return;
            }

            if (!result.success) {
                setError(result.error);
                setLoading(false);
                return;
            }

            setUsers(result.data.users ?? []);
            setMetrics(result.data.metrics ?? EMPTY_METRICS);
            setLoading(false);
        }

        load();

        return () => {
            mounted = false;
        };
    }, []);

    async function changeUserRole(userId, role) {
        setPendingUserId(userId);
        const result = await adminAPI.updateUserRole(userId, role);

        if (!result.success) {
            setPendingUserId(null);
            return result;
        }

        setUsers((currentUsers) => {
            const nextUsers = currentUsers.map((user) => (
                user.id === userId ? { ...user, ...result.data.user } : user
            ));

            setMetrics(buildMetrics(nextUsers));
            return nextUsers;
        });

        setPendingUserId(null);
        return result;
    }

    async function removeUser(userId) {
        setPendingUserId(userId);
        const result = await adminAPI.deleteUser(userId);

        if (!result.success) {
            setPendingUserId(null);
            return result;
        }

        setUsers((currentUsers) => {
            const nextUsers = currentUsers.filter((user) => user.id !== userId);
            setMetrics(buildMetrics(nextUsers));
            return nextUsers;
        });

        setPendingUserId(null);
        return result;
    }

    return {
        users,
        metrics,
        loading,
        error,
        pendingUserId,
        changeUserRole,
        removeUser,
    };
}