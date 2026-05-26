import { AlertTriangle, Search, ShieldCheck, Trash2, UserCog, Users, UserPlus, X, Loader } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import PaginationControls from '@/components/ui/PaginationControls';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { useAdminUsersView } from '@/hooks/useAdminUsersView';
import { formatDateTime } from '@/lib/formatters';

const USERS_PER_PAGE = 8;

const ROLE_OPTIONS = [
    { value: 'admin', label: 'Admin' },
    { value: 'teacher', label: 'Teacher' },
];

export default function AdminUsersView() {
    const { users, metrics, loading, error, pendingUserId, changeUserRole, removeUser, createUser } = useAdminUsersView();
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [feedback, setFeedback] = useState({ type: '', message: '' });

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', role: 'teacher' });
    const [createFeedback, setCreateFeedback] = useState({ type: '', message: '' });
    const [isCreating, setIsCreating] = useState(false);

    async function handleCreateUser(e) {
        e.preventDefault();
        setCreateFeedback({ type: '', message: '' });
        setIsCreating(true);

        if (!createForm.name || !createForm.email || !createForm.password) {
            setCreateFeedback({ type: 'error', message: 'Por favor, rellena todos los campos.' });
            setIsCreating(false);
            return;
        }

        const result = await createUser(createForm);

        if (!result.success) {
            setCreateFeedback({ type: 'error', message: result.error || 'Error al crear el usuario.' });
            setIsCreating(false);
            return;
        }

        setCreateFeedback({ type: 'success', message: 'Usuario creado exitosamente.' });
        setCreateForm({ name: '', email: '', password: '', role: 'teacher' });
        setIsCreating(false);
        setTimeout(() => {
            setShowCreateModal(false);
            setCreateFeedback({ type: '', message: '' });
        }, 1500);
    }

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

    const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE)), [filteredUsers.length]);

    const paginatedUsers = useMemo(() => {
        const startIndex = (page - 1) * USERS_PER_PAGE;
        return filteredUsers.slice(startIndex, startIndex + USERS_PER_PAGE);
    }, [filteredUsers, page]);

    const selectedUser = useMemo(() => {
        return filteredUsers.find((user) => user.id === selectedUserId) ?? filteredUsers[0] ?? null;
    }, [filteredUsers, selectedUserId]);

    useEffect(() => {
        setPage(1);
    }, [query]);

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    useEffect(() => {
        if (!paginatedUsers.length) {
            if (selectedUserId !== null) {
                setSelectedUserId(null);
            }
            return;
        }

        const selectedUserIsVisible = paginatedUsers.some((user) => user.id === selectedUser?.id);

        if (!selectedUserIsVisible) {
            setSelectedUserId(paginatedUsers[0].id);
        }
    }, [paginatedUsers, selectedUser, selectedUserId]);

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
                            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">Roles, búsqueda y acciones rápidas.</p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/15 px-5 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/20 cursor-pointer"
                            >
                                <UserPlus className="h-4 w-4" />
                                Crear usuario
                            </button>
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
                            {paginatedUsers.map((user) => (
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

                        <PaginationControls
                            page={page}
                            totalPages={totalPages}
                            totalItems={filteredUsers.length}
                            pageSize={USERS_PER_PAGE}
                            onPageChange={setPage}
                            itemLabel="usuarios"
                        />
                    </section>

                    <div className="space-y-6">
                        <section className="rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
                            <div className="mb-5 flex items-center justify-between gap-4">
                                <div>
                                    <h2 className="font-['Orbitron'] text-xl font-black text-white">Acciones</h2>
                                    <p className="mt-2 text-sm text-zinc-500">Cuenta seleccionada.</p>
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
                                                <p className="mt-2 text-sm text-red-100/80">Acción permanente.</p>
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
                                ].map((row) => (
                                    <div key={row.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <p className="font-semibold text-white">{row.label}</p>
                                            <span className={`font-['Orbitron'] text-2xl font-black ${row.tone === 'cyan' ? 'text-cyan-200' : 'text-emerald-200'}`}>{row.value}</span>
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
            
            {/* Modal de Creación de Usuario */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isCreating && setShowCreateModal(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        />

                        {/* Modal Container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/95 p-6 shadow-2xl backdrop-blur-2xl sm:p-8"
                        >
                            {/* Glowing light ball behind */}
                            <div className="pointer-events-none absolute -left-12 -top-12 h-32 w-32 rounded-full bg-emerald-500/10 blur-[50px]" />
                            <div className="pointer-events-none absolute -right-12 -bottom-12 h-32 w-32 rounded-full bg-cyan-500/10 blur-[50px]" />

                            {/* Header */}
                            <div className="relative mb-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-2.5 text-emerald-200">
                                        <UserPlus className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="font-['Orbitron'] text-lg font-black text-white">Nuevo usuario</h2>
                                        <p className="text-xs text-zinc-500">Alta de cuenta administrativa.</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    disabled={isCreating}
                                    onClick={() => setShowCreateModal(false)}
                                    className="rounded-xl border border-white/6 bg-white/3 p-2 text-zinc-400 hover:bg-white/8 hover:text-white transition disabled:opacity-50"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleCreateUser} className="relative space-y-4">
                                {createFeedback.message && (
                                    <div className={`rounded-xl border px-3.5 py-2.5 text-xs font-semibold leading-relaxed ${createFeedback.type === 'error' ? 'border-red-500/20 bg-red-500/10 text-red-200' : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200'}`}>
                                        {createFeedback.message}
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Nombre Completo</label>
                                    <input
                                        type="text"
                                        required
                                        disabled={isCreating}
                                        value={createForm.name}
                                        onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                                        placeholder="Ej. Albert Monlau"
                                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-400/30 transition placeholder:text-zinc-600 disabled:opacity-50"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Correo Electrónico</label>
                                    <input
                                        type="email"
                                        required
                                        disabled={isCreating}
                                        value={createForm.email}
                                        onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                                        placeholder="ejemplo@monlau.com"
                                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-400/30 transition placeholder:text-zinc-600 disabled:opacity-50"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Contraseña temporal</label>
                                    <input
                                        type="password"
                                        required
                                        minLength="6"
                                        disabled={isCreating}
                                        value={createForm.password}
                                        onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                                        placeholder="••••••••"
                                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-400/30 transition placeholder:text-zinc-600 disabled:opacity-50"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Rol asignado</label>
                                    <select
                                        value={createForm.role}
                                        disabled={isCreating}
                                        onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                                        className="w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-400/30 transition disabled:opacity-50"
                                    >
                                        <option value="teacher" className="bg-zinc-950 text-white">Teacher</option>
                                        <option value="admin" className="bg-zinc-950 text-white">Admin</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 py-3 text-sm font-bold text-zinc-950 transition hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {isCreating ? (
                                        <>
                                            <Loader className="h-4 w-4 animate-spin" />
                                            Creando cuenta...
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="h-4 w-4" />
                                            Guardar y dar de alta
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}