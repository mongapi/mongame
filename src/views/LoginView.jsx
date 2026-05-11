import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Sparkles, AlertCircle, Loader } from 'lucide-react';
import { authAPI } from '@/api/api';

export default function LoginView() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const result = await authAPI.login(formData);
            if (result.success) {
                const role = result.data.user.role;
                role === 'admin' ? navigate('/admin/dashboard') : navigate('/dashboard');
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
        <div className="flex h-screen w-full items-center justify-center p-4">
            <div className="relative w-full max-w-md">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-break/20 blur-[80px]" />
                <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-terra/20 blur-[80px]" />
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10 w-full glass-card p-8 sm:p-10 rounded-3xl">
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-break/20 text-break border border-break/30">
                            <Sparkles className="h-8 w-8" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Bienvenido de vuelta</h1>
                        <p className="text-sm text-zinc-400">Ingresa tus credenciales para continuar</p>
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
                                <label className="mb-2 block text-sm font-medium text-zinc-300">Correo Electrónico</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500">
                                        <Mail className="h-5 w-5" />
                                    </span>
                                    <input type="email" required disabled={isLoading}
                                        className="w-full rounded-xl border border-white/10 bg-surface/50 py-3 pl-12 pr-4 text-white placeholder-zinc-500 focus:border-break focus:outline-none focus:ring-1 focus:ring-break transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="tu@correo.com" value={formData.email}
                                        autoComplete="email"
                                        onChange={(e) => setFormData({...formData, email: e.target.value})} />
                                </div>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-zinc-300">Contraseña</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500">
                                        <Lock className="h-5 w-5" />
                                    </span>
                                    <input type="password" required disabled={isLoading}
                                        className="w-full rounded-xl border border-white/10 bg-surface/50 py-3 pl-12 pr-4 text-white placeholder-zinc-500 focus:border-break focus:outline-none focus:ring-1 focus:ring-break transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="••••••••" value={formData.password}
                                        autoComplete="current-password"
                                        onChange={(e) => setFormData({...formData, password: e.target.value})} />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
                                <input type="checkbox" className="rounded border-white/10 bg-surface/50 accent-break" />
                                Mantenerme conectado
                            </label>
                            <a href="#" className="text-sm font-medium text-break hover:text-break/80">¿Olvidaste tu contraseña?</a>
                        </div>
                        <button type="submit" disabled={isLoading}
                            className="btn-primary flex w-full justify-center items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed">
                            {isLoading ? (
                                <><Loader className="h-5 w-5 animate-spin" />Iniciando sesión...</>
                            ) : (
                                <><ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />Iniciar Sesión</>
                            )}
                        </button>
                    </form>
                    <div className="mt-8 text-center text-sm text-zinc-400">
                        ¿No tienes una cuenta?{' '}
                        <button onClick={() => navigate('/register')} className="font-semibold text-break hover:text-break/80">
                            Regístrate
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}