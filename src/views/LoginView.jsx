import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Sparkles, AlertCircle, Loader } from 'lucide-react';
import { authAPI } from '@/api/api';
import monlauLogo from '../public/images/monlau_logo.png';
import blurBg from '../public/images/blur01.jpg';

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
        <div className="relative flex h-screen w-full items-center justify-center p-4 overflow-hidden bg-zinc-950">
            {/* Background image with subtle animation and gradient overlay */}
            <div className="absolute inset-0 z-0 select-none pointer-events-none">
                <img 
                    src={blurBg} 
                    alt="Background Blur" 
                    className="w-full h-full object-cover opacity-45 scale-105"
                />
                {/* Radial dark overlay to fade to the edges and keep elements perfectly readable */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#09090b_85%)]" />
                <div className="absolute inset-0 bg-zinc-950/40" />
            </div>

            <div className="relative w-full max-w-md z-10">
                {/* Glowing ambient light balls */}
                <div className="absolute -top-[15%] -left-[15%] w-[60%] h-[60%] rounded-full bg-break/25 blur-[100px] pointer-events-none" />
                <div className="absolute -bottom-[15%] -right-[15%] w-[60%] h-[60%] rounded-full bg-terra/15 blur-[100px] pointer-events-none" />
                
                <motion.div 
                    initial={{ opacity: 0, y: 30 }} 
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="relative z-10 w-full glass-card p-8 sm:p-10 rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
                >
                    <div className="mb-8 text-center relative">
                        <img 
                            src={monlauLogo} 
                            alt="Monlau Logo" 
                            className="mx-auto mb-6 h-16 w-auto object-contain filter drop-shadow-[0_0_20px_rgba(250,204,21,0.8)]" 
                        />
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 drop-shadow-sm">
                            Bienvenido de vuelta
                        </h1>
                        <p className="text-sm text-zinc-300 drop-shadow-sm font-medium">
                            Ingresa tus credenciales para continuar
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 relative">
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }} 
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-200 backdrop-blur-md"
                            >
                                <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-400" />
                                <span className="text-sm font-medium">{error}</span>
                            </motion.div>
                        )}
                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-zinc-200">
                                    Correo Electrónico
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-400">
                                        <Mail className="h-5 w-5" />
                                    </span>
                                    <input 
                                        type="email" 
                                        required 
                                        disabled={isLoading}
                                        className="w-full rounded-xl border border-white/15 bg-zinc-950/60 py-3 pl-12 pr-4 text-white placeholder-zinc-500 focus:border-break focus:outline-none focus:ring-1 focus:ring-break transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                                        placeholder="tu@correo.com" 
                                        value={formData.email}
                                        autoComplete="email"
                                        onChange={(e) => setFormData({...formData, email: e.target.value})} 
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-zinc-200">
                                    Contraseña
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-400">
                                        <Lock className="h-5 w-5" />
                                    </span>
                                    <input 
                                        type="password" 
                                        required 
                                        disabled={isLoading}
                                        className="w-full rounded-xl border border-white/15 bg-zinc-950/60 py-3 pl-12 pr-4 text-white placeholder-zinc-500 focus:border-break focus:outline-none focus:ring-1 focus:ring-break transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                                        placeholder="••••••••" 
                                        value={formData.password}
                                        autoComplete="current-password"
                                        onChange={(e) => setFormData({...formData, password: e.target.value})} 
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer font-medium select-none">
                                <input 
                                    type="checkbox" 
                                    className="rounded border-white/15 bg-zinc-950/60 accent-break h-4 w-4 transition-colors" 
                                />
                                Mantenerme conectado
                            </label>
                            <a href="#" className="text-sm font-semibold text-break hover:text-break/80 transition-colors">
                                ¿Olvidaste tu contraseña?
                            </a>
                        </div>
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="btn-primary flex w-full justify-center items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {isLoading ? (
                                <><Loader className="h-5 w-5 animate-spin" />Iniciando sesión...</>
                            ) : (
                                <><ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />Iniciar Sesión</>
                            )}
                        </button>
                    </form>
                    <div className="mt-8 text-center text-sm text-zinc-300 relative">
                        ¿No tienes una cuenta?{' '}
                        <button 
                            onClick={() => navigate('/register')} 
                            className="font-bold text-break hover:text-break/80 transition-colors cursor-pointer"
                        >
                            Regístrate
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}