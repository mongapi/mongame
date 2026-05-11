import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, UserPlus, AlertCircle, Loader } from 'lucide-react';
import { authAPI } from '@/api/api';

export default function RegisterView() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '', password: '', password_confirmation: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (formData.password !== formData.password_confirmation) {
            setError('Las contraseñas no coinciden');
            return;
        }
        setIsLoading(true);
        try {
            const result = await authAPI.register(formData);
            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Error inesperado. Intenta de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center p-4">
            <div className="relative w-full max-w-md">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-break/20 blur-[80px]" />
                <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-terra/20 blur-[80px]" />
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10 w-full glass-card p-8 sm:p-10 rounded-3xl">
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-break/20 text-break border border-break/30">
                            <UserPlus className="h-8 w-8" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Crear una cuenta</h1>
                        <p className="text-sm text-zinc-400">Únete a nosotros para empezar a crear</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300">
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                <span className="text-sm">{error}</span>
                            </motion.div>
                        )}
                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-zinc-300">Nombre Completo</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500"><User className="h-5 w-5" /></span>
                                    <input type="text" required disabled={isLoading} autoComplete="name"
                                        className="w-full rounded-xl border border-white/10 bg-surface/50 py-3 pl-12 pr-4 text-white placeholder-zinc-500 focus:border-break focus:outline-none focus:ring-1 focus:ring-break transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="Tu Nombre" value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})} />
                                </div>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-zinc-300">Correo Electrónico</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500"><Mail className="h-5 w-5" /></span>
                                    <input type="email" required disabled={isLoading} autoComplete="email"
                                        className="w-full rounded-xl border border-white/10 bg-surface/50 py-3 pl-12 pr-4 text-white placeholder-zinc-500 focus:border-break focus:outline-none focus:ring-1 focus:ring-break transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="tu@correo.com" value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})} />
                                </div>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-zinc-300">Contraseña</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500"><Lock className="h-5 w-5" /></span>
                                    <input type="password" required disabled={isLoading} minLength="6" autoComplete="new-password"
                                        className="w-full rounded-xl border border-white/10 bg-surface/50 py-3 pl-12 pr-4 text-white placeholder-zinc-500 focus:border-break focus:outline-none focus:ring-1 focus:ring-break transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="••••••••" value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})} />
                                </div>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-zinc-300">Confirmar Contraseña</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500"><Lock className="h-5 w-5" /></span>
                                    <input type="password" required disabled={isLoading} autoComplete="new-password"
                                        className="w-full rounded-xl border border-white/10 bg-surface/50 py-3 pl-12 pr-4 text-white placeholder-zinc-500 focus:border-break focus:outline-none focus:ring-1 focus:ring-break transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="••••••••" value={formData.password_confirmation}
                                        onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})} />
                                </div>
                            </div>
                        </div>
                        <button type="submit" disabled={isLoading}
                            className="btn-primary flex w-full justify-center items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed">
                            {isLoading ? (
                                <><Loader className="h-5 w-5 animate-spin" />Creando cuenta...</>
                            ) : (
                                <><ArrowRight className="h-5 w-5" />Registrarse</>
                            )}
                        </button>
                    </form>
                    <div className="mt-8 text-center text-sm text-zinc-400">
                        ¿Ya tienes una cuenta?{' '}
                        <button onClick={() => navigate('/login')} className="font-semibold text-break hover:text-break/80">
                            Inicia Sesión
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}