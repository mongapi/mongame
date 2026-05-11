import { motion } from "motion/react";
import { Settings2, PlusCircle, LayoutDashboard } from "lucide-react";

export default function ConfigView({ setView }) {
    return (
        <div className="min-h-screen pl-0 lg:pl-24 pr-8 py-12 relative flex flex-col items-center">
            {/* Background Cyberpunk */}
            <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none bg-void">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(226,232,240,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(226,232,240,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
                <motion.div animate={{ opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 5, repeat: Infinity }} className="absolute top-0 right-0 w-[800px] h-[800px] bg-break/10 rounded-full blur-[150px]" />
            </div>

            <div className="text-center mb-16 mt-8">
                <div className="inline-flex items-center justify-center p-4 bg-break/10 rounded-full mb-6 border border-break/20">
                    <Settings2 className="w-12 h-12 text-break" />
                </div>
                <h1 className="text-4xl font-black font-display text-white tracking-widest mb-4">
                    PANEL DE CONFIGURACIÓN
                </h1>
                <p className="text-zinc-400 font-bold tracking-wider max-w-2xl mx-auto">
                    Central de operaciones para configurar sesiones de juego interactivo y administrar ajustes del sistema educativo.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl">
                {/* Crear Quiz Card */}
                <motion.button
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setView("ConfigQuiz")}
                    className="p-8 rounded-2xl glass-card hover:border-break/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] transition-all group flex flex-col items-center text-center gap-6 relative overflow-hidden text-left cursor-pointer"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-break/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="p-5 bg-surface/50 rounded-2xl border border-white/5 group-hover:bg-break/10 group-hover:border-break/30 transition-all z-10">
                        <PlusCircle className="w-10 h-10 text-break" />
                    </div>
                    
                    <div className="z-10">
                        <h2 className="text-xl font-bold font-display tracking-wider text-white mb-2 text-center group-hover:text-break transition-colors">
                            CREAR QUIZ
                        </h2>
                        <p className="text-sm text-zinc-500 font-medium leading-relaxed text-center group-hover:text-zinc-400 transition-colors">
                            Configura una nueva sesión de juego. Define modo colaborativo o individual, selecciona mesas activas y crea la playlist.
                        </p>
                    </div>
                </motion.button>
                
                {/* Placeholder 1 */}
                <div className="p-8 rounded-2xl glass-card opacity-40 flex flex-col items-center text-center gap-6">
                     <div className="p-5 bg-surface/50 rounded-2xl border border-white/5">
                        <LayoutDashboard className="w-10 h-10 text-zinc-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold font-display tracking-wider text-zinc-300 mb-2">
                            MÓDULOS DE CLASE
                        </h2>
                        <p className="text-sm text-zinc-500 font-medium leading-relaxed">
                            Administración de estudiantes, permisos y control de acceso. (Próximamente)
                        </p>
                    </div>
                </div>
                
                {/* Placeholder 2 */}
                <div className="p-8 rounded-2xl glass-card opacity-40 flex flex-col items-center text-center gap-6">
                     <div className="p-5 bg-surface/50 rounded-2xl border border-white/5">
                        <Settings2 className="w-10 h-10 text-zinc-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold font-display tracking-wider text-zinc-300 mb-2">
                            SISTEMA GLOBAL
                        </h2>
                        <p className="text-sm text-zinc-500 font-medium leading-relaxed">
                            Ajustes generales de la aplicación, red, conexión entre mesas físicas y servidor.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
