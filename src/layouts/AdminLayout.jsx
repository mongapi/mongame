import { Outlet } from "react-router-dom";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import AdminNavbar from "@/components/organisms/AdminNavbar";
import blurBg from '../public/images/as03.jpg';

const AdminLayout = () => {
    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <div className="relative min-h-screen bg-zinc-950 text-white overflow-x-hidden flex">
                {/* Fixed Background image with subtle animation and gradient overlay */}
                <div className="fixed inset-0 z-0 select-none pointer-events-none overflow-hidden">
                    <img
                        src={blurBg}
                        alt="Background Blur"
                        className="w-full h-full object-cover opacity-20 scale-105"
                    />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#09090b_90%)]" />
                    <div className="absolute inset-0 bg-zinc-950/20" />
                    <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-emerald-600/12 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-amber-600/8 rounded-full blur-[100px]" />
                </div>

                <div className="relative z-10 flex w-full min-h-screen">
                    <AdminNavbar />
                    <div className="min-h-screen flex-1 pb-24 md:pb-0 md:ml-20 relative z-10">
                        <Outlet />
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default AdminLayout;