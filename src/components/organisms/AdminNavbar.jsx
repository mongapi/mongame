import { motion } from 'motion/react';
import { LayoutDashboard, Users, Gamepad2, Power } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '@/api/api';
import monlauLogo from '../../public/images/monlau_logo.png';
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
                "relative flex w-full items-center justify-center gap-4 overflow-hidden rounded-xl p-3 transition-all duration-300 md:justify-start group",
                isActive
                    ? "bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                    : "text-zinc-500 hover:text-white hover:bg-white/5"
            )}
        >
            <Icon className="w-6 h-6 z-10 relative" />
            <span className="absolute left-14 hidden whitespace-nowrap text-sm font-bold tracking-wider opacity-0 transition-all duration-300 group-hover:opacity-100 md:block">
                {label}
            </span>
        </motion.button>
    );
};

export default function AdminNavbar() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await authAPI.logout();
        navigate('/', { replace: true });
    };

    return (
        <motion.nav className="fixed inset-x-0 bottom-0 z-50 flex items-center gap-2 border-t border-white/10 bg-zinc-950/90 px-3 py-3 backdrop-blur-xl md:left-0 md:top-0 md:bottom-0 md:h-screen md:w-20 md:flex-col md:items-center md:gap-0 md:border-r md:border-t-0 md:px-0 md:py-8 md:hover:w-64 md:transition-all md:duration-500 md:ease-out group">
            <div className="hidden w-full cursor-pointer justify-center md:mb-12 md:flex" onClick={() => navigate('/admin/dashboard')}>
                <img
                    src={monlauLogo}
                    alt="Monlau Logo"
                    className="w-12 h-12 object-contain filter drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]"
                />
            </div>
            <div className="grid flex-1 w-full grid-cols-4 gap-2 md:block md:px-4 md:space-y-4 md:gap-0">
                <NavItem icon={LayoutDashboard} label="DASHBOARD"   path="/admin/dashboard" />
                <NavItem icon={Users}           label="USUARIOS"    path="/admin/users" />
                <NavItem icon={Gamepad2}        label="TIPOS JUEGO" path="/admin/game-types" />
                <motion.button
                    whileHover={{ scale: 1.1, x: 5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="relative flex w-full items-center justify-center gap-4 overflow-hidden rounded-xl p-3 text-zinc-500 transition-all duration-300 hover:bg-white/5 hover:text-white md:justify-start group"
                >
                    <Power className="w-6 h-6 z-10 relative" />
                    <span className="absolute left-14 hidden whitespace-nowrap text-sm font-bold tracking-wider opacity-0 transition-all duration-300 group-hover:opacity-100 md:block">
                        CERRAR
                    </span>
                </motion.button>
            </div>
        </motion.nav>
    );
}