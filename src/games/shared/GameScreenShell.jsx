import { AlertCircle, Loader } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

function CenterState({ children }) {
    return (
        <div className="flex min-h-screen items-center justify-center p-6 text-white">
            <div className="w-full max-w-xl">{children}</div>
        </div>
    );
}

export function GameLoadingState({ title = 'Cargando sesión...' }) {
    return (
        <CenterState>
            <Card className="border-white/10 bg-black/40 text-white backdrop-blur-xl">
                <CardContent className="flex items-center justify-center gap-3 py-10">
                    <Loader className="h-6 w-6 animate-spin text-cyan-300" />
                    <span className="text-sm font-medium tracking-wide text-zinc-200">{title}</span>
                </CardContent>
            </Card>
        </CenterState>
    );
}

export function GameErrorState({ title = 'No se pudo cargar el juego', message }) {
    return (
        <CenterState>
            <Card className="border-red-500/30 bg-red-500/10 text-white backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-200">
                        <AlertCircle className="h-5 w-5" />
                        {title}
                    </CardTitle>
                    <CardDescription className="text-red-100/80">{message}</CardDescription>
                </CardHeader>
            </Card>
        </CenterState>
    );
}