import { cn } from "@/lib/utils";

export const AuroraBackground = ({ children, className }) => {
    return (
        <div className={cn("relative w-full min-h-screen overflow-hidden bg-void", className)}>
            {/* Las luces flotantes (Blobs) */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-break rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob"></div>
            <div className="absolute top-0 right-1/4 w-[30rem] h-[30rem] bg-paper rounded-full mix-blend-screen filter blur-[120px] opacity-10 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-terra rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob animation-delay-4000"></div>

            {/* Ruido sutil para textura (opcional, da realismo) */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] brightness-100 contrast-150 mix-blend-overlay"></div>

            {/* El contenido real va encima */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};