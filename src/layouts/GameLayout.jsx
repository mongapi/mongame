import { Outlet } from "react-router-dom";
import { AuroraBackground } from "@/components/organisms/AuroraBackground";

const GameLayout = () => {
    return (
        <AuroraBackground className="min-h-screen w-full bg-void text-paper overflow-hidden">
            <Outlet />
        </AuroraBackground>
    );
};

export default GameLayout;