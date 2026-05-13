import { Routes, Route } from "react-router-dom";

import TeacherLayout from "@/layouts/TeacherLayout";
import AdminLayout from "@/layouts/AdminLayout";
import GameLayout from "@/layouts/GameLayout";

// Vistas públicas
import LoginView from "@/views/LoginView";
import RegisterView from "@/views/RegisterView";
import JoinView from "@/views/JoinView";
import HomeView from "@/views/HomeView";

// Vistas profesor
import DashboardView from "@/views/DashboardView";
import GameChooserView from "@/views/GameChooserView";
import GameEditorView from "@/views/GameEditorView";
import GameLibraryView from "@/views/GameLibraryView";
import LessonPlanEditorView from "@/views/LessonPlanEditorView";

// Vistas admin (las crearemos después)
import AdminDashboardView from "@/views/admin/AdminDashboardView";
// import AdminUsersView from "@/views/admin/AdminUsersView";
// import AdminGameTypesView from "@/views/admin/AdminGameTypesView";
// import AdminMediaView from "@/views/admin/AdminMediaView";

// Juegos
import MemoryGame from "@/games/MemoryGame";
import MemoryGame3D from "@/games/MemoryGame3D";
import FastQuiz from "@/games/FastQuiz";
import CompletarEnunciado from "@/games/CompletarEnunciado";
import OrdenarCronologias from "@/games/OrdenarCronologias";
import Shooter3D from "@/games/Shooter3D";
import AdivinaQue3D from "@/games/AdivinaQue3D";
import OrbitalOrder from "@/games/OrbitalOrder";

export default function AppRoutes() {
    return (
        <Routes>
            {/* Públicas */}
            <Route path="/" element={<HomeView />} />
            <Route path="/login" element={<LoginView />} />
            <Route path="/register" element={<RegisterView />} />
            <Route path="/join" element={<JoinView />} />

            {/* Profesor */}
            <Route element={<TeacherLayout />}>
                <Route path="/dashboard" element={<DashboardView />} />
                <Route path="/dashboard/:sessionId" element={<DashboardView />} />
                <Route path="/games" element={<GameLibraryView />} />
                <Route path="/games/create" element={<GameChooserView />} />
                <Route path="/games/create/:type" element={<GameEditorView />} />
                <Route path="/games/:id/edit" element={<GameEditorView />} />
                <Route path="/lesson-plans/create" element={<LessonPlanEditorView />} />
                <Route path="/lesson-plans/:id/edit" element={<LessonPlanEditorView />} />
                <Route path="/sessions/create" element={<GameChooserView />} />
                <Route path="/sessions/create/:type" element={<GameEditorView />} />
            </Route>

            {/* Admin - descomentar cuando tengamos las vistas */}
             <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboardView />} />
                {/* <Route path="/admin/users" element={<AdminUsersView />} /> */}
                {/* <Route path="/admin/game-types" element={<AdminGameTypesView />} /> */}
                {/* <Route path="/admin/media" element={<AdminMediaView />} /> */}
             </Route> 

            {/* Juegos */}
            <Route element={<GameLayout />}>
                <Route path="/jugar/memory" element={<MemoryGame />} />
                <Route path="/jugar/memory3d" element={<MemoryGame3D />} />
                <Route path="/jugar/quiz" element={<FastQuiz />} />
                <Route path="/jugar/completar" element={<CompletarEnunciado />} />
                <Route path="/jugar/cronologias" element={<OrdenarCronologias />} />
                <Route path="/jugar/shooter" element={<Shooter3D />} />
                <Route path="/jugar/adivina" element={<AdivinaQue3D />} />
                <Route path="/jugar/orbital" element={<OrbitalOrder />} />
            </Route>

            <Route path="*" element={<HomeView />} />
        </Routes>
    );
}