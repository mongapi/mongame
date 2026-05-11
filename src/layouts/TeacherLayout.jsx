import { Outlet } from "react-router-dom";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import TeacherNavbar from "@/components/organisms/TeacherNavbar";

const TeacherLayout = () => {
    return (
        <ProtectedRoute allowedRoles={['teacher']}>
            <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden flex">
                <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
                    <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[100px]" />
                </div>
                <TeacherNavbar />
                <div className="flex-1 ml-20 min-h-screen">
                    <Outlet />
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default TeacherLayout;