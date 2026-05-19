import { AlertTriangle, Search, ShieldCheck, Trash2, UserCog, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { useAdminUsersView } from '@/hooks/useAdminUsersView';
import { formatDateTime } from '@/lib/formatters';

const ROLE_OPTIONS = [
    { value: 'admin', label: 'Admin' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'student', label: 'Student' },
];

export default function AdminUsersView() {
    const { users, metrics, loading, error, pendingUserId, changeUserRole, removeUser } = useAdminUsersView();
    const [query, setQuery] = useState('');
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [feedback, setFeedback] = useState({ type: '', message: '' });

    const filteredUsers = useMemo(() => {
        const normalized = query.trim().toLowerCase();

        if (!normalized) {
            return users;
        }

        return users.filter((user) => {
            const haystack = `${user.name} ${user.email} ${user.role}`.toLowerCase();
            return haystack.includes(normalized);
        });
    }, [users, query]);

    const selectedUser = useMemo(() => {
        return filteredUsers.find((user) => user.id === selectedUserId) ?? filteredUsers[0] ?? null;
    }, [filteredUsers, selectedUserId]);

    useEffect(() => {
        if (!selectedUser && filteredUsers[0]) {
            setSelectedUserId(filteredUsers[0].id);
        }
    }, [filteredUsers, selectedUser]);

    async function handleRoleChange(userId, role) {
        setFeedback({ type: '', message: '' });
        const result = await changeUserRole(userId, role);

        if (!result.success) {
            setFeedback({ type: 'error', message: result.error });
            return;
        }

        setFeedback({ type: 'success', message: 'Rol actualizado.' });
    }

    async function handleDelete(userId) {
        setFeedback({ type: '', message: '' });
        const result = await removeUser(userId);

        if (!result.success) {
            setFeedback({ type: 'error', message: result.error });
            return;
        }

        setFeedback({ type: 'success', message: 'Usuario eliminado.' });
        setSelectedUserId(null);
    }

    if (loading) {
        return <LoadingScreen title="Cargando usuarios..." />;
    }

    if (error) {
        return <div className="min-h-screen flex items-center justify-center px-4 text-red-100"><div className="max-w-2xl rounded-3xl border border-red-500/20 bg-red-500/10 p-8">{error}</div></div>;
    }

    return (
        <div className="min-h-screen px-4 py-6 text-white sm:px-6 sm:py-10 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-8">
                <section className="rounded-[2rem] border border-white/10 bg-black/30 p-6 backdrop-blur-xl sm:p-8">
                    <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-200">
                                Admin / Usuarios
                            </div>
                            <h1 className="mt-5 font-['Orbitron'] text-3xl font-black text-white sm:text-4xl">Gestión de usuarios</h1>
                            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">Cambio de rol y eliminación.</p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Link to="/admin/dashboard" className="rounded-2xl border border-cyan-400/30 bg-cyan-400/15 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20">Volver al dashboard</Link>
                            <Link to="/admin/audit" className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Ver actividad</Link>
                        </div>
                    </div>

                    <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-5"><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Usuarios</p><p className="mt-3 font-['Orbitron'] text-3xl font-black text-white">{metrics.total}</p></div>
                        <div className="rounded-3xl border border-purple-400/20 bg-purple-400/10 p-5"><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Admins</p><p className="mt-3 font-['Orbitron'] text-3xl font-black text-white">{metrics.admins}</p></div>
                        <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5"><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Teachers</p><p className="mt-3 font-['Orbitron'] text-3xl font-black text-white">{metrics.teachers}</p></div>
                        <div className="rounded-3xl border border-amber-400/20 bg-amber-400/10 p-5"><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Nuevas 7d</p><p className="mt-3 font-['Orbitron'] text-3xl font-black text-white">{metrics.new_last_7_days}</p></div>
                    </div>
                </section>

                {feedback.message ? (
                    <div className={`rounded-2xl border px-4 py-3 text-sm ${feedback.type === 'error' ? 'border-red-500/20 bg-red-500/10 text-red-100' : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100'}`}>
                        {feedback.message}
                    </div>
                ) : null}

                <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                    <section className="rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
                        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="font-['Orbitron'] text-xl font-black text-white">Listado de usuarios</h2>
                                <p className="mt-2 text-sm text-zinc-500">Selecciona una cuenta.</p>
                            </div>
                            <div className="relative w-full sm:max-w-sm">
                                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar usuario" className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-cyan-400/30" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            {filteredUsers.map((user) => (
                                <button
                                    key={user.id}
                                    type="button"
                                    onClick={() => setSelectedUserId(user.id)}
                                    className={`grid w-full gap-3 rounded-2xl border px-4 py-4 text-left transition md:grid-cols-[minmax(0,1fr)_150px_180px] md:items-center ${selectedUser?.id === user.id ? 'border-cyan-400/30 bg-cyan-400/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                                >
                                    <div className="min-w-0">
                                        <p className="truncate font-semibold text-white">{user.name}</p>
                                        <p className="truncate text-sm text-zinc-500">{user.email}</p>
                                    </div>
                                    <div>
                                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${user.role === 'admin' ? 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200' : user.role === 'teacher' ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200' : 'border-amber-400/20 bg-amber-400/10 text-amber-200'}`}>
                                            {user.role}
                                        </span>
                                    </div>
                                    <p className="text-sm text-zinc-500 md:text-right">Alta: {formatDateTime(user.created_at)}</p>
                                </button>
                            ))}

                            {filteredUsers.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-10 text-center text-sm text-zinc-500">No hay usuarios que coincidan con la búsqueda.</div>
                            ) : null}
                        </div>
                    </section>

                    <div className="space-y-6">
                        <section className="rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
                            <div className="mb-5 flex items-center justify-between gap-4">
                                <div>
                                    <h2 className="font-['Orbitron'] text-xl font-black text-white">Panel de gestión</h2>
                                    <p className="mt-2 text-sm text-zinc-500">Acciones sobre la cuenta seleccionada.</p>
                                </div>
                                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-cyan-200"><UserCog className="h-5 w-5" /></div>
                            </div>

                            {selectedUser ? (
                                <div className="space-y-4">
                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                        <p className="font-semibold text-white">{selectedUser.name}</p>
                                        <p className="mt-1 text-sm text-zinc-500">{selectedUser.email}</p>
                                        <div className="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-zinc-400">
                                            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">ID {selectedUser.id}</span>
                                            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">{selectedUser.role}</span>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Cambiar rol</p>
                                        <select
                                            value={selectedUser.role}
                                            onChange={(event) => handleRoleChange(selectedUser.id, event.target.value)}
                                            disabled={pendingUserId === selectedUser.id}
                                            className="mt-3 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/30 disabled:opacity-60"
                                        >
                                            {ROLE_OPTIONS.map((option) => (
                                                <option key={option.value} value={option.value} className="bg-zinc-950 text-white">
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="mt-0.5 h-5 w-5 text-red-300" />
                                            <div>
                                                <p className="font-semibold text-white">Eliminar usuario</p>
                                                <p className="mt-2 text-sm text-red-100/80">La cuenta se borra solo si backend lo permite.</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(selectedUser.id)}
                                            disabled={pendingUserId === selectedUser.id}
                                            className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-red-400/30 bg-red-500/20 px-4 py-3 text-sm font-semibold text-red-100 transition hover:bg-red-500/30 disabled:opacity-60"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Eliminar cuenta
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-10 text-center text-sm text-zinc-500">No hay usuarios disponibles.</div>
                            )}
                        </section>

                        <section className="rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
                            <div className="mb-5 flex items-center justify-between gap-4">
                                <div>
                                    <h2 className="font-['Orbitron'] text-xl font-black text-white">Distribución por rol</h2>
                                    <p className="mt-2 text-sm text-zinc-500">Balance actual.</p>
                                </div>
                                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-cyan-200"><Users className="h-5 w-5" /></div>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { label: 'Admins', value: metrics.admins, tone: 'cyan' },
                                    { label: 'Teachers', value: metrics.teachers, tone: 'emerald' },
                                    { label: 'Students', value: metrics.students, tone: 'amber' },
                                ].map((row) => (
                                    <div key={row.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <p className="font-semibold text-white">{row.label}</p>
                                            <span className={`font-['Orbitron'] text-2xl font-black ${row.tone === 'cyan' ? 'text-cyan-200' : row.tone === 'emerald' ? 'text-emerald-200' : 'text-amber-200'}`}>{row.value}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
                            <div className="mb-5 flex items-center justify-between gap-4">
                                <div>
                                    <h2 className="font-['Orbitron'] text-xl font-black text-white">Pulso operativo</h2>
                                    <p className="mt-2 text-sm text-zinc-500">Resumen reciente.</p>
                                </div>
                                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-emerald-200"><ShieldCheck className="h-5 w-5" /></div>
                            </div>

                            <div className="space-y-3">
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Cuentas nuevas</p><p className="mt-2 text-sm text-zinc-300">{metrics.new_last_7_days} altas en siete días.</p></div>
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Teachers</p><p className="mt-2 text-sm text-zinc-300">{metrics.teachers} cuentas docentes.</p></div>
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Admins</p><p className="mt-2 text-sm text-zinc-300">{metrics.admins} cuentas admin.</p></div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}