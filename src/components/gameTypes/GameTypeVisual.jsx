import { Box, Brain, Clock, HelpCircle, Layers, Search, Shapes, Sun, Target, Type, User } from 'lucide-react';

const GAME_TYPE_META_BY_CODE = {
    quiz: { icon: Brain, color: 'text-purple-400', previewType: 'quiz' },
    memory: { icon: Search, color: 'text-blue-400', previewType: 'memory' },
    filling_blanks: { icon: Type, color: 'text-green-400', previewType: 'blank' },
    timeline: { icon: Clock, color: 'text-yellow-400', previewType: 'timeline' },
    shooting: { icon: Target, color: 'text-red-400', previewType: 'shooter' },
    guess_who: { icon: User, color: 'text-cyan-400', previewType: 'guess' },
    memory3d: { icon: Layers, color: 'text-blue-300', previewType: 'memory3d' },
    orbital: { icon: Sun, color: 'text-orange-400', previewType: 'orbital' },
    orbital_order: { icon: Sun, color: 'text-orange-400', previewType: 'orbital' },
    hangman: { icon: HelpCircle, color: 'text-lime-400', previewType: 'hangman' },
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
    const base = 'h-32 rounded-2xl border overflow-hidden relative';

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
            <div className={`${base} bg-amber-950/40 border-amber-700/40`}>
                <div className="relative flex h-full w-full items-center justify-between">
                    {/* Magical Temporal SVG */}
                    <svg viewBox="0 0 200 100" className="h-full w-full stroke-amber-400 fill-none" strokeLinecap="round" strokeLinejoin="round">
                        {/* Temporal Timeline Path */}
                        <path d="M 15 50 L 175 50" className="stroke-amber-500/40" strokeWidth="2.5" strokeDasharray="5 4" />
                        <path d="M 15 50 L 175 50" className="stroke-amber-300/15" strokeWidth="6" />

                        {/* Connectors */}
                        <path d="M 50 50 L 50 26" className="stroke-amber-500/50" strokeWidth="1.2" strokeDasharray="2 2" />
                        <path d="M 90 50 L 90 74" className="stroke-amber-500/50" strokeWidth="1.2" strokeDasharray="2 2" />
                        <path d="M 130 50 L 130 26" className="stroke-amber-500/50" strokeWidth="1.2" strokeDasharray="2 2" />
                        <path d="M 170 50 L 170 74" className="stroke-amber-500/50" strokeWidth="1.2" strokeDasharray="2 2" />

                        {/* Orbs */}
                        {/* Orb 1: Above */}
                        <circle cx="50" cy="26" r="9" className="fill-amber-500/10 stroke-none" />
                        <circle cx="50" cy="26" r="5.5" className="fill-amber-400 stroke-amber-200" strokeWidth="1.5" />
                        <circle cx="50" cy="26" r="2" className="fill-white stroke-none" />

                        {/* Orb 2: Below (Active / Being Fixed) */}
                        <circle cx="90" cy="74" r="10" className="fill-amber-500/20 stroke-none" />
                        <circle cx="90" cy="74" r="5.5" className="fill-amber-400 stroke-amber-200" strokeWidth="1.5" />
                        <circle cx="90" cy="74" r="2" className="fill-white stroke-none" />
                        <circle cx="90" cy="74" r="8" className="stroke-amber-300/40 fill-none" strokeWidth="1" strokeDasharray="1.5 1.5" />

                        {/* Orb 3: Above */}
                        <circle cx="130" cy="26" r="9" className="fill-amber-500/10 stroke-none" />
                        <circle cx="130" cy="26" r="5.5" className="fill-amber-400 stroke-amber-200" strokeWidth="1.5" />
                        <circle cx="130" cy="26" r="2" className="fill-white stroke-none" />

                        {/* Orb 4: Below */}
                        <circle cx="170" cy="74" r="9" className="fill-amber-500/10 stroke-none" />
                        <circle cx="170" cy="74" r="5.5" className="fill-amber-400 stroke-amber-200" strokeWidth="1.5" />
                        <circle cx="170" cy="74" r="2" className="fill-white stroke-none" />

                        {/* Temporal Portal Emitters */}
                        {/* Left Emitter */}
                        <circle cx="15" cy="50" r="5" className="fill-amber-950 stroke-amber-500" strokeWidth="2" />
                        <circle cx="15" cy="50" r="1.5" className="fill-white stroke-none" />

                        {/* Right Main Portal */}
                        <g className="translate-x-[178px] translate-y-[25px]">
                            <ellipse cx="6" cy="25" rx="6" ry="24" className="stroke-amber-400/20 fill-amber-500/5" strokeWidth="3" />
                            <ellipse cx="6" cy="25" rx="4" ry="20" className="stroke-amber-400/80 fill-none" strokeWidth="2" />
                            <ellipse cx="6" cy="25" rx="1.5" ry="12" className="stroke-amber-200/95 fill-amber-300/20" strokeWidth="1.5" />
                        </g>
                    </svg>
                </div>
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
                        <User className="w-5 h-5 text-cyan-400/60" />
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

    if (type === 'orbital') {
        return (
            <div className={`${base} bg-orange-950/40 border-orange-700/40`}>
                <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-radial-[circle_at_center] from-orange-200/10 via-orange-500/5 to-transparent">
                    <div className="absolute h-10 w-10 rounded-full bg-amber-300/70 shadow-[0_0_20px_rgba(252,211,77,0.7)]" />
                    {[36, 58, 80].map((size, index) => (
                        <div
                            key={size}
                            className="absolute rounded-full border border-orange-300/35"
                            style={{
                                width: `${size}%`,
                                height: `${size}%`,
                                transform: `rotate(${index * 18}deg)`,
                            }}
                        />
                    ))}
                    {[
                        { top: '28%', left: '63%', color: 'bg-emerald-300' },
                        { top: '56%', left: '24%', color: 'bg-sky-300' },
                        { top: '70%', left: '60%', color: 'bg-fuchsia-300' },
                    ].map((planet, index) => (
                        <div
                            key={index}
                            className={`absolute h-3.5 w-3.5 rounded-full ${planet.color} shadow-[0_0_12px_rgba(255,255,255,0.3)]`}
                            style={{ top: planet.top, left: planet.left }}
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (type === 'hangman') {
        return (
            <div className={`${base} bg-lime-950/40 border-lime-700/40`}>
                <div className="relative flex h-full w-full items-center justify-between bg-linear-to-br from-lime-300/8 via-transparent to-emerald-300/8 px-6">
                    {/* Gallows and Stick Figure SVG */}
                    <svg viewBox="0 0 100 100" className="h-20 w-20 shrink-0 stroke-lime-200/80 fill-none stroke-[3.5]" strokeLinecap="round" strokeLinejoin="round">
                        {/* Gallows */}
                        <path d="M 20 80 L 60 80 M 35 80 L 35 20 L 70 20" className="stroke-lime-200/45" />
                        {/* Rope */}
                        <path d="M 70 20 L 70 34" className="stroke-lime-200/60" />
                        {/* Head */}
                        <circle cx="70" cy="41" r="7" className="stroke-lime-200/80" />
                        {/* Torso */}
                        <path d="M 70 48 L 70 64" className="stroke-lime-200/80" />
                        {/* Left Arm */}
                        <path d="M 70 52 L 60 60" className="stroke-lime-200/80" />
                        {/* Right Arm */}
                        <path d="M 70 52 L 80 60" className="stroke-lime-200/80" />
                        {/* Left Leg */}
                        <path d="M 70 64 L 61 76" className="stroke-lime-200/80" />
                        {/* Right Leg */}
                        <path d="M 70 64 L 79 76" className="stroke-lime-200/80" />
                    </svg>

                    <div className="flex flex-col items-end gap-3.5 pr-2">
                        <div className="flex gap-1.5">
                            {['C', '_', 'D', '_', 'G', 'O'].map((character, index) => (
                                <div key={index} className="flex flex-col items-center gap-1">
                                    <span className={`text-xs font-black ${character === '_' ? 'text-lime-300' : 'text-white/70'}`}>{character === '_' ? '?' : character}</span>
                                    <div className={`h-0.5 w-4 rounded ${character === '_' ? 'bg-lime-300' : 'bg-white/25'}`} />
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-1">
                            {['A', 'E', 'I', 'O'].map((letter) => (
                                <div key={letter} className="flex h-5 w-5 items-center justify-center rounded-md border border-lime-500/25 bg-lime-500/10 text-[9px] font-bold text-lime-200/80">
                                    {letter}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
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