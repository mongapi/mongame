import { Outlet } from "react-router-dom";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import AdminNavbar from "@/components/organisms/AdminNavbar";

const AdminLayout = () => {
    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden flex">
                <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
                    <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-amber-600/10 rounded-full blur-[100px]" />
                </div>
                <AdminNavbar />
                <div className="min-h-screen flex-1 pb-24 md:pb-0 md:ml-20">
                    <Outlet />
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default AdminLayout;