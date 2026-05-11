import { UploadCloud, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DataUpload() {
    return (
        <div className="w-full max-w-2xl bg-black/40 backdrop-blur-xl border border-dashed border-zinc-700 rounded-3xl p-12 text-center relative group hover:border-purple-500/50 transition-colors">
            {/* ICONO CENTRAL */}
            <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                <UploadCloud className="w-10 h-10 text-purple-500" />
            </div>

            <h2 className="text-3xl font-bold text-white mb-4">Inyectar Datos del Juego</h2>
            <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                Arrastra tu archivo <span className="text-green-400 font-mono">.XLSX</span> o <span className="text-green-400 font-mono">.JSON</span> aquí para compilar las preguntas.
            </p>

            {/* BOTÓN INPUT FALSO */}
            <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 rounded-xl text-lg shadow-lg shadow-purple-900/20">
                Seleccionar Archivo Local
            </Button>

            {/* LISTA DE ARCHIVOS RECIENTES (Visual) */}
            <div className="mt-12 text-left space-y-3">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Historial de Cargas</p>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5">
                    <div className="flex items-center gap-3">
                        <FileSpreadsheet className="text-green-500 w-5 h-5" />
                        <span className="text-zinc-300">examen_final_react.xlsx</span>
                    </div>
                    <CheckCircle2 className="text-purple-500 w-5 h-5" />
                </div>
            </div>
        </div>
    );
}