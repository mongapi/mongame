import { Routes, Route } from "react-router-dom";

import TeacherLayout from "@/layouts/TeacherLayout";
import AdminLayout from "@/layouts/AdminLayout";
import GameLayout from "@/layouts/GameLayout";

// Vistas públicas
import LoginView from "@/views/LoginView";
import RegisterView from "@/views/RegisterView";
import JoinView from "@/views/JoinView";
import HomeView from "@/views/HomeView";
import AboutView from "@/views/AboutView";

// Vistas profesor
import DashboardView from "@/views/DashboardView";
import ConfigView from "@/views/ConfigView";
import GameChooserView from "@/views/GameChooserView";
import GameEditorView from "@/views/GameEditorView";
import GameLibraryView from "@/views/GameLibraryView";
import LessonPlanEditorView from "@/views/LessonPlanEditorView";


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
import Hangman3D from "@/games/Hangman3D";
import OrbitalOrder from "@/games/OrbitalOrder";
import { ROUTE_PATHS } from "@/router/paths";

export default function AppRoutes() {
    return (
        <Routes>
            {/* Públicas */}
            <Route path={ROUTE_PATHS.home} element={<HomeView />} />
            <Route path={ROUTE_PATHS.about} element={<AboutView />} />
            <Route path={ROUTE_PATHS.login} element={<LoginView />} />
            <Route path={ROUTE_PATHS.register} element={<RegisterView />} />
            <Route path={ROUTE_PATHS.join} element={<JoinView />} />

            {/* Profesor */}
            <Route element={<TeacherLayout />}>
                <Route path={ROUTE_PATHS.dashboard} element={<DashboardView />} />
                <Route path={ROUTE_PATHS.dashboardSession} element={<DashboardView />} />
                <Route path={ROUTE_PATHS.config} element={<ConfigView />} />
                <Route path={ROUTE_PATHS.games} element={<GameLibraryView />} />
                <Route path={ROUTE_PATHS.gamesCreate} element={<GameChooserView />} />
                <Route path={ROUTE_PATHS.gameCreateByType} element={<GameEditorView />} />
                <Route path={ROUTE_PATHS.gameEdit} element={<GameEditorView />} />
                <Route path={ROUTE_PATHS.lessonPlansCreate} element={<LessonPlanEditorView />} />
                <Route path={ROUTE_PATHS.lessonPlanEdit} element={<LessonPlanEditorView />} />
                <Route path={ROUTE_PATHS.sessionsCreate} element={<GameChooserView />} />
                <Route path={ROUTE_PATHS.sessionCreateByType} element={<GameEditorView />} />
            </Route>

            {/* Admin - descomentar cuando tengamos las vistas */}
             <Route element={<AdminLayout />}>
                <Route path={ROUTE_PATHS.adminDashboard} element={<AdminDashboardView />} />
                {/* <Route path="/admin/users" element={<AdminUsersView />} /> */}
                {/* <Route path="/admin/game-types" element={<AdminGameTypesView />} /> */}
                {/* <Route path="/admin/media" element={<AdminMediaView />} /> */}
             </Route> 

            {/* Juegos */}
            <Route element={<GameLayout />}>
                <Route path={ROUTE_PATHS.playMemory} element={<MemoryGame />} />
                <Route path={ROUTE_PATHS.playMemory3D} element={<MemoryGame3D />} />
                <Route path={ROUTE_PATHS.playQuiz} element={<FastQuiz />} />
                <Route path={ROUTE_PATHS.playFillingBlanks} element={<CompletarEnunciado />} />
                <Route path={ROUTE_PATHS.playTimeline} element={<OrdenarCronologias />} />
                <Route path={ROUTE_PATHS.playShooter} element={<Shooter3D />} />
                <Route path={ROUTE_PATHS.playGuessWho} element={<AdivinaQue3D />} />
                <Route path={ROUTE_PATHS.playHangman} element={<Hangman3D />} />
                <Route path={ROUTE_PATHS.playOrbital} element={<OrbitalOrder />} />
            </Route>

            <Route path={ROUTE_PATHS.fallback} element={<HomeView />} />
        </Routes>
    );
}