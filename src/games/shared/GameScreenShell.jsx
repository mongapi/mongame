import { AlertCircle, Loader } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

import LoadingScreen from '@/components/ui/LoadingScreen';

function CenterState({ children }) {
    return (
        <div className="flex min-h-screen items-center justify-center p-6 text-white">
            <div className="w-full max-w-xl">{children}</div>
        </div>
    );
}

export function GameLoadingState({ title = 'Cargando sesión...' }) {
    return <LoadingScreen title={title} fullScreen={true} />;
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