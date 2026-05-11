import { Monitor, Users, Wifi, WifiOff, Settings, Plus, Signal } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function Stations() {
    // He adaptado los colores para que sean "Gradients de Borde" en lugar de fondos sólidos
    const stations = [
        {
            id: 1,
            name: 'Estación Roja',
            color: 'text-red-400',
            borderColor: 'border-red-500/50',
            glow: 'shadow-[0_0_15px_rgba(239,68,68,0.15)]',
            status: 'online',
            students: 6,
            device: 'iPad Pro 12.9"',
            ip: '192.168.1.101',
        },
        {
            id: 2,
            name: 'Estación Azul',
            color: 'text-cyan-400',
            borderColor: 'border-cyan-500/50',
            glow: 'shadow-[0_0_15px_rgba(6,182,212,0.15)]',
            status: 'online',
            students: 5,
            device: 'Tablet Samsung S8',
            ip: '192.168.1.102',
        },
        {
            id: 3,
            name: 'Estación Verde',
            color: 'text-emerald-400',
            borderColor: 'border-emerald-500/50',
            glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]',
            status: 'online',
            students: 4,
            device: 'iPad Air 5',
            ip: '192.168.1.103',
        },
        {
            id: 4,
            name: 'Estación Amarilla',
            color: 'text-amber-400',
            borderColor: 'border-amber-500/50',
            glow: 'shadow-none',
            status: 'offline',
            students: 0,
            device: 'iPad Pro 12.9"',
            ip: '192.168.1.104',
        },
    ];

    const onlineCount = stations.filter(s => s.status === 'online').length;

    return (
        <div className="space-y-8 p-4">
            {/* --- HEADER DE SECCIÓN --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white font-cyber">
                        Nodos de <span className="text-primary">Juego</span>
                    </h2>
                    <p className="text-zinc-400 mt-1">
                        Monitoreo en tiempo real de los dispositivos del aula.
                    </p>
                </div>
                <Button className="bg-primary hover:bg-primary/80 text-white shadow-[0_0_20px_rgba(var(--primary),0.3)]">
                    <Plus className="w-4 h-4 mr-2" /> Nueva Estación
                </Button>
            </div>

            {/* --- GRID DE ESTACIONES --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {stations.map((station) => (
                    <Card
                        key={station.id}
                        className={cn(
                            "bg-zinc-950/50 backdrop-blur-sm border-zinc-800 transition-all duration-300 hover:-translate-y-1",
                            station.status === 'online' ? station.borderColor : "border-zinc-800 opacity-70",
                            station.status === 'online' ? station.glow : ""
                        )}
                    >
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className={cn("p-2.5 rounded-lg bg-zinc-900 border border-zinc-800", station.color)}>
                                        <Monitor className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-bold text-zinc-100">
                                            {station.name}
                                        </CardTitle>
                                        <CardDescription className="text-zinc-500 font-mono text-xs mt-1">
                                            ID: {station.device}
                                        </CardDescription>
                                    </div>
                                </div>


                            </div>
                        </CardHeader>

                        <CardContent className="py-4">
                            <div className="grid grid-cols-2 gap-3">
                                {/* Dato: Alumnos */}
                                <div className="bg-zinc-900/40 p-3 rounded-md border border-zinc-800/50">
                                    <div className="flex items-center gap-2 mb-1 text-zinc-500">
                                        <Users className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase">Usuarios</span>
                                    </div>
                                    <p className="text-2xl font-bold text-white">{station.students}</p>
                                </div>

                                {/* Dato: IP */}
                                <div className="bg-zinc-900/40 p-3 rounded-md border border-zinc-800/50">
                                    <div className="flex items-center gap-2 mb-1 text-zinc-500">
                                        <Signal className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase">IP Local</span>
                                    </div>
                                    <p className="text-lg font-mono text-zinc-300 truncate">
                                        {station.ip}
                                    </p>
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="gap-3 pt-0">
                            <Button
                                className="flex-1"
                                variant={station.status === 'online' ? "default" : "secondary"}
                                disabled={station.status !== 'online'}
                            >
                                Gestionar
                            </Button>
                            <Button variant="outline" size="icon" className="border-zinc-800 hover:bg-zinc-800 text-zinc-400">
                                <Settings className="w-4 h-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* --- PANEL INFORMATIVO RED --- */}
            <Card className="bg-gradient-to-r from-zinc-900 to-zinc-950 border-zinc-800">
                <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-primary/10 text-primary">
                            <Wifi className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-white">Red del Aula: <span className="text-primary font-mono">Aula_5A_EduPlay</span></h4>
                            <p className="text-zinc-400 text-sm">Conexión segura y encriptada</p>
                        </div>
                    </div>

                    <div className="text-right flex items-center gap-3 bg-zinc-950/50 px-4 py-2 rounded-lg border border-zinc-800">
                        <div className="text-sm text-zinc-500">Estado Global</div>
                        <div className="text-2xl font-bold text-white">
                            <span className="text-green-400">{onlineCount}</span>
                            <span className="text-zinc-600">/</span>
                            {stations.length}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}