import { motion } from 'motion/react';
import { Home, Gamepad2, Activity, Settings, Power, Library } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '@/api/api';
import { cn } from '@/lib/utils';

const NavItem = ({ icon: Icon, label, path }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const isActive = location.pathname === path || location.pathname.startsWith(path + '/');

    return (
        <motion.button
            whileHover={{ scale: 1.1, x: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(path)}
            className={cn(
                "relative p-3 rounded-xl transition-all duration-300 group flex items-center gap-4 w-full overflow-hidden",
                isActive
                    ? "bg-blue-500/20 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                    : "text-zinc-500 hover:text-white hover:bg-white/5"
            )}
        >
            <Icon className="w-6 h-6 z-10 relative" />
            <span className="text-sm font-bold tracking-wider whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 absolute left-14">
                {label}
            </span>
            {isActive && <div className="absolute inset-0 border-l-2 border-blue-500" />}
        </motion.button>
    );
};

export default function TeacherNavbar() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await authAPI.logout();
        navigate('/login', { replace: true });
    };

    return (
        <motion.nav className="fixed left-0 top-0 h-screen w-20 hover:w-64 bg-zinc-950/80 backdrop-blur-xl border-r border-white/10 z-50 flex flex-col items-center py-8 transition-all duration-500 ease-out group">
            <div className="mb-12 cursor-pointer" onClick={() => navigate('/dashboard')}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 rounded-full border-2 border-dashed border-blue-500 flex items-center justify-center"
                >
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 blur-md absolute" />
                </motion.div>
            </div>
            <div className="flex-1 w-full px-4 space-y-4">
                <NavItem icon={Home}     label="INICIO"      path="/dashboard" />
                <NavItem icon={Activity} label="DASHBOARD"   path="/dashboard" />
                <NavItem icon={Library}  label="BIBLIOTECA"  path="/games" />
                <NavItem icon={Gamepad2} label="CREAR SESIÓN" path="/sessions/create" />
                <NavItem icon={Settings} label="CONFIG"      path="/config" />
                <motion.button
                    whileHover={{ scale: 1.1, x: 5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="relative p-3 rounded-xl transition-all duration-300 group flex items-center gap-4 w-full overflow-hidden text-zinc-500 hover:text-white hover:bg-white/5"
                >
                    <Power className="w-6 h-6 z-10 relative" />
                    <span className="text-sm font-bold tracking-wider whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 absolute left-14">
                        CERRAR
                    </span>
                </motion.button>
            </div>
        </motion.nav>
    );
}