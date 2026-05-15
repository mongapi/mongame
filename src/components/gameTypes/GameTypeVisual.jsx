import { Box, Brain, Clock, Layers, Search, Shapes, Shuffle, Sparkles, Target, Type } from 'lucide-react';

const GAME_TYPE_META_BY_CODE = {
    quiz: { icon: Brain, color: 'text-purple-400', previewType: 'quiz' },
    memory: { icon: Search, color: 'text-blue-400', previewType: 'memory' },
    filling_blanks: { icon: Type, color: 'text-green-400', previewType: 'blank' },
    timeline: { icon: Clock, color: 'text-yellow-400', previewType: 'timeline' },
    shooting: { icon: Target, color: 'text-red-400', previewType: 'shooter' },
    guess_who: { icon: Box, color: 'text-cyan-400', previewType: 'guess' },
    memory3d: { icon: Layers, color: 'text-blue-300', previewType: 'memory3d' },
    orbital: { icon: Shuffle, color: 'text-orange-400', previewType: 'sorting3d' },
    orbital_order: { icon: Shuffle, color: 'text-orange-400', previewType: 'sorting3d' },
    hangman: { icon: Sparkles, color: 'text-lime-400', previewType: 'blank' },
};

export function getGameTypeVisualMeta(typeCode) {
    return GAME_TYPE_META_BY_CODE[typeCode] ?? {
        icon: Shapes,
        color: 'text-fuchsia-300',
        previewType: typeCode,
    };
}

export function GameTypeIconBadge({ icon: Icon, color, className = '' }) {
    return (
        <div className={`rounded-xl border border-white/10 bg-white/5 p-2.5 transition-colors duration-300 group-hover:border-white/20 group-hover:bg-white/10 ${color} ${className}`.trim()}>
            <Icon className="h-6 w-6" />
        </div>
    );
}

export function GameTypePreview({ type }) {
    const base = 'h-32 rounded-lg border overflow-hidden relative';

    if (type === 'quiz') {
        return (
            <div className={`${base} bg-purple-950/40 border-purple-700/40 p-3 flex flex-col gap-2`}>
                <div className="h-1.5 w-full bg-purple-900/60 rounded-full overflow-hidden">
                    <div className="h-full w-2/3 bg-purple-400 rounded-full" />
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-purple-300/70 tracking-wider uppercase">Pregunta</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                    {['A', 'B', 'C', 'D'].map((label, index) => (
                        <div key={label} className={`h-5 rounded flex items-center px-2 gap-1.5 ${index === 0 ? 'bg-purple-500/50 border border-purple-400/50' : 'bg-white/5 border border-white/10'}`}>
                            <span className="text-[9px] font-bold text-purple-200">{label}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (type === 'memory') {
        return (
            <div className={`${base} bg-blue-950/40 border-blue-700/40 p-3 grid grid-cols-4 gap-1.5`}>
                {[...Array(8)].map((_, index) => (
                    <div
                        key={index}
                        className={`rounded transition-all ${
                            index === 2 || index === 6
                                ? 'bg-blue-400/70 border border-blue-300/50 shadow-[0_0_8px_rgba(96,165,250,0.4)]'
                                : 'bg-blue-900/50 border border-blue-700/40'
                        }`}
                    />
                ))}
            </div>
        );
    }

    if (type === 'blank') {
        return (
            <div className={`${base} bg-emerald-950/40 border-emerald-700/40 p-3 flex flex-col items-center justify-center gap-3`}>
                <div className="flex gap-1.5 items-end">
                    {['R', '_', 'A', 'C', '_', 'O', 'N'].map((character, index) => (
                        <div key={index} className="flex flex-col items-center gap-0.5">
                            <span className={`text-sm font-black font-mono ${character === '_' ? 'text-emerald-400' : 'text-white/70'}`}>{character === '_' ? '?' : character}</span>
                            <div className={`h-0.5 w-4 rounded ${character === '_' ? 'bg-emerald-400' : 'bg-white/20'}`} />
                        </div>
                    ))}
                </div>
                <div className="flex gap-1">
                    {['A', 'E', 'I', 'O', 'U'].map((vowel) => (
                        <div key={vowel} className="w-5 h-5 rounded bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center">
                            <span className="text-[8px] font-bold text-emerald-300/70">{vowel}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (type === 'timeline') {
        return (
            <div className={`${base} bg-amber-950/40 border-amber-700/40 p-3 flex flex-col justify-between`}>
                <div className="absolute left-6 top-3 bottom-3 w-0.5 bg-amber-600/30 rounded" />
                {[{ width: '60%' }, { width: '45%' }, { width: '75%' }, { width: '50%' }].map(({ width }, index) => (
                    <div key={index} className="flex items-center gap-2 ml-0.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-amber-900 shadow-[0_0_6px_rgba(251,191,36,0.5)] shrink-0" />
                        <div className="flex-1 h-4 rounded bg-amber-500/20 border border-amber-500/30" style={{ width }} />
                    </div>
                ))}
            </div>
        );
    }

    if (type === 'shooter') {
        return (
            <div className={`${base} bg-red-950/40 border-red-700/40 flex items-center justify-center`}>
                <div className="relative flex items-center justify-center">
                    <div className="absolute w-20 h-20 rounded-full border-2 border-red-500/20 animate-ping" style={{ animationDuration: '3s' }} />
                    <div className="absolute w-14 h-14 rounded-full border border-red-500/30" />
                    <div className="absolute w-8 h-8 rounded-full border border-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-red-400 shadow-[0_0_10px_rgba(239,68,68,0.7)]" />
                </div>
                <div className="absolute top-2.5 right-3 flex gap-1">
                    {[...Array(3)].map((_, index) => (
                        <div key={index} className="w-2 h-2 rounded-full bg-red-400/60" />
                    ))}
                </div>
            </div>
        );
    }

    if (type === 'guess') {
        return (
            <div className={`${base} bg-cyan-950/40 border-cyan-700/40 flex items-center justify-center gap-4`}>
                <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                        <Box className="w-5 h-5 text-cyan-400/60" />
                    </div>
                    <div className="flex gap-1">
                        {[...Array(5)].map((_, index) => (
                            <div key={index} className={`w-4 h-0.5 rounded ${index < 2 ? 'bg-cyan-400' : 'bg-cyan-800'}`} />
                        ))}
                    </div>
                </div>
                <div className="text-[10px] font-bold text-cyan-400/60 tracking-widest uppercase">Quien soy</div>
            </div>
        );
    }

    if (type === 'memory3d') {
        return (
            <div className={`${base} bg-blue-950/40 border-blue-700/40 p-3 grid grid-cols-2 gap-2`}>
                {[0, 1, 2, 3].map((index) => (
                    <div
                        key={index}
                        className={`rounded-md border ${
                            index % 2 === 0
                                ? 'bg-blue-600/50 border-blue-400/50 shadow-[0_4px_0_rgba(30,64,175,0.8)]'
                                : 'bg-blue-900/50 border-blue-700/40 shadow-[0_4px_0_rgba(15,23,42,0.8)]'
                        }`}
                    />
                ))}
            </div>
        );
    }

    if (type === 'sorting3d') {
        return (
            <div className={`${base} bg-orange-950/40 border-orange-700/40 px-4 pb-3 pt-2 flex items-end justify-center gap-2`}>
                {[{ height: '55%', active: false }, { height: '75%', active: true }, { height: '40%', active: false }, { height: '85%', active: false }, { height: '60%', active: false }].map(({ height, active }, index) => (
                    <div
                        key={index}
                        className="flex-1 rounded-t-sm"
                        style={{
                            height,
                            background: active ? 'rgba(251,146,60,0.9)' : 'rgba(251,146,60,0.25)',
                            borderTop: `2px solid ${active ? 'rgba(253,186,116,0.9)' : 'rgba(251,146,60,0.35)'}`,
                            boxShadow: active ? '0 0 10px rgba(251,146,60,0.4)' : 'none',
                        }}
                    />
                ))}
            </div>
        );
    }

    return <div className={`${base} bg-fuchsia-950/30 border-fuchsia-700/30`} />;
}