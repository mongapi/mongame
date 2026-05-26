import React from 'react';
import { motion } from 'motion/react';
import monlauLogo from '../../public/images/monlau_logo.png';

export default function LoadingScreen({ title = 'Cargando...', fullScreen = true, showLogo = true }) {
    const containerClasses = fullScreen 
        ? "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-md"
        : "flex flex-col items-center justify-center py-12 px-6 w-full";

    return (
        <div className={containerClasses}>
            {/* Glowing background ambient */}
            {fullScreen && (
                <>
                    <div className="absolute w-[400px] h-[400px] rounded-full bg-cyan-500/5 blur-[100px] pointer-events-none" />
                    <div className="absolute w-[200px] h-[200px] rounded-full bg-emerald-500/5 blur-[80px] pointer-events-none" />
                </>
            )}

            <div className="relative flex flex-col items-center">
                {showLogo ? (
                    <motion.div
                        animate={{
                            opacity: [0.3, 1, 0.3],
                            scale: [0.98, 1.02, 0.98],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="relative flex items-center justify-center"
                    >
                        <img 
                            src={monlauLogo} 
                            alt="Cargando Monlau" 
                            className="h-32 w-auto object-contain filter drop-shadow-[0_0_25px_rgba(6,182,212,0.6)]"
                        />
                    </motion.div>
                ) : null}

                <motion.p
                    animate={{
                        opacity: [0.4, 1, 0.4]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.3
                    }}
                    className={`${showLogo ? 'mt-6' : ''} text-sm font-bold uppercase tracking-[0.2em] text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.3)] font-['Orbitron']`}
                >
                    {title}
                </motion.p>
            </div>
        </div>
    );
}
