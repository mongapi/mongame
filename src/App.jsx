import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import AppRoutes from './router/routes';
import monlauLogo from './public/images/monlau_logo.png';

export default function App() {
    const [isSplashActive, setIsSplashActive] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsSplashActive(false);
        }, 2200); // 2.2 seconds splash animation
        return () => clearTimeout(timer);
    }, []);

    return (
        <Router>
            <AnimatePresence mode="wait">
                {isSplashActive ? (
                    <motion.div
                        key="splash"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
                        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-zinc-950 overflow-hidden"
                    >
                        {/* Background glowing ambient light */}
                        <div className="absolute w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
                        <div className="absolute w-[300px] h-[300px] rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />

                        <div className="relative flex flex-col items-center">
                            {/* Sliding Logo Container */}
                            <motion.div
                                initial={{ x: -150, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -150, opacity: 0 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 80,
                                    damping: 15,
                                    duration: 1.2
                                }}
                                className="relative flex items-center justify-center"
                            >
                                <img
                                    src={monlauLogo}
                                    alt="Monlau Neon Logo"
                                    className="h-32 w-auto object-contain filter drop-shadow-[0_0_35px_rgba(6,182,212,0.8)]"
                                />
                            </motion.div>

                            {/* Loading neon text under the logo */}
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{
                                    opacity: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                                    y: { delay: 0.5, duration: 0.5 }
                                }}
                                className="mt-8 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]"
                            >
                                Iniciando MonGame...
                            </motion.p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="app-content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        className="min-h-screen bg-zinc-950 text-white"
                    >
                        <AppRoutes />
                    </motion.div>
                )}
            </AnimatePresence>
        </Router>
    );
}