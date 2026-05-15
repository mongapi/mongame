import { AlertCircle, ArrowRight, ChevronRight, Loader, LogIn, Sparkles } from 'lucide-react';
import { useHomeView } from '@/hooks/useHomeView';

/* ─── Hexágonos flotantes: 3 capas de profundidad ─────────────── */
const HEXAGONS = [
    // Capa trasera — grandes, lentos, tenues
    { x: 3,  y: 10, s: 140, o: 0.055, d: 0.007, dur: '16s', delay: '0s'    },
    { x: 80, y: 7,  s: 115, o: 0.04,  d: 0.009, dur: '18s', delay: '3s'    },
    { x: 62, y: 68, s: 150, o: 0.035, d: 0.006, dur: '20s', delay: '1.5s'  },
    { x: 22, y: 78, s: 105, o: 0.045, d: 0.008, dur: '14s', delay: '5s'    },
    // Capa media
    { x: 13, y: 42, s: 74,  o: 0.09,  d: 0.016, dur: '11s', delay: '0.7s'  },
    { x: 74, y: 33, s: 66,  o: 0.08,  d: 0.018, dur: '9s',  delay: '2.5s'  },
    { x: 91, y: 62, s: 82,  o: 0.07,  d: 0.014, dur: '12s', delay: '4s'    },
    { x: 44, y: 87, s: 60,  o: 0.1,   d: 0.02,  dur: '8s',  delay: '1.2s'  },
    { x: 36, y: 14, s: 70,  o: 0.075, d: 0.015, dur: '15s', delay: '3.8s'  },
    // Capa delantera — pequeños, rápidos, brillantes
    { x: 7,  y: 58, s: 38,  o: 0.22,  d: 0.032, dur: '7s',  delay: '0.4s'  },
    { x: 66, y: 4,  s: 28,  o: 0.18,  d: 0.038, dur: '6s',  delay: '1.8s'  },
    { x: 54, y: 93, s: 34,  o: 0.24,  d: 0.035, dur: '8s',  delay: '0.9s'  },
    { x: 93, y: 84, s: 24,  o: 0.28,  d: 0.044, dur: '5.5s',delay: '2.2s'  },
    { x: 29, y: 52, s: 42,  o: 0.16,  d: 0.028, dur: '9s',  delay: '3.1s'  },
    { x: 77, y: 54, s: 30,  o: 0.2,   d: 0.036, dur: '7.5s',delay: '0s'    },
];

const HEX_COLOR = [
    (o) => `rgba(34,211,238,${o})`,
    (o) => `rgba(251,191,36,${o})`,
    (o) => `rgba(167,139,250,${o})`,
];

export default function HomePage() {
    const {
        pin,
        loading,
        error,
        ready,
        getParallaxStyle,
        handlePinSubmit,
        handlePinChange,
        goToLogin,
        goToRegister,
    } = useHomeView();

    return (
        <>
        <style>{`
            @keyframes hexFloat {
                0%, 100% { translate: 0 0px;   }
                40%       { translate: 0 -14px; }
                75%       { translate: 0 -6px;  }
            }
            @keyframes fadeUp {
                from { opacity: 0; transform: translateY(22px); }
                to   { opacity: 1; transform: translateY(0);    }
            }
            @keyframes titleGlow {
                0%, 100% { filter: drop-shadow(0 0 18px rgba(34,211,238,.45)); }
                50%       { filter: drop-shadow(0 0 38px rgba(34,211,238,.75)); }
            }
            @keyframes badgePulse {
                0%, 100% { box-shadow: 0 0 0 0   rgba(34,211,238,.35); }
                50%       { box-shadow: 0 0 0 6px rgba(34,211,238,0);   }
            }
            @keyframes spin { to { transform: rotate(360deg); } }

            .card-t { transition: transform .3s ease, box-shadow .3s ease, border-color .3s ease; }
            .card-t:hover {
                transform: translateY(-8px) !important;
                border-color: rgba(34,211,238,.45) !important;
                box-shadow: 0 24px 56px rgba(34,211,238,.12), 0 8px 24px rgba(0,0,0,.5) !important;
            }
            .card-s { transition: transform .3s ease, box-shadow .3s ease, border-color .3s ease; }
            .card-s:hover {
                transform: translateY(-8px) !important;
                border-color: rgba(251,191,36,.45) !important;
                box-shadow: 0 24px 56px rgba(251,191,36,.12), 0 8px 24px rgba(0,0,0,.5) !important;
            }
            .pin-field { transition: border-color .2s, box-shadow .2s; }
            .pin-field:focus {
                outline: none;
                border-color: rgba(251,191,36,.7) !important;
                box-shadow: 0 0 0 3px rgba(251,191,36,.15), 0 0 24px rgba(251,191,36,.1);
            }
            .btn-c { transition: transform .2s, box-shadow .2s; }
            .btn-c:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(34,211,238,.38) !important; }
            .btn-a { transition: background .2s, color .2s, transform .2s, box-shadow .2s; }
            .btn-a:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(251,191,36,.38) !important; }
            .lk { transition: color .15s; }
            .lk:hover { color: rgba(255,255,255,.75) !important; }
        `}</style>

        <div style={{
            minHeight: '100vh',
            background: `
                radial-gradient(ellipse 75% 55% at 18% 8%,  rgba(34,211,238,.07) 0%, transparent 50%),
                radial-gradient(ellipse 55% 45% at 82% 85%, rgba(251,191,36,.06) 0%, transparent 50%),
                #07091a
            `,
            color: '#e2e8f0',
            fontFamily: "'Exo 2', system-ui, sans-serif",
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
        }}>

            {/* ── Grid tenue ── */}
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                backgroundImage: `
                    linear-gradient(rgba(255,255,255,.022) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,.022) 1px, transparent 1px)
                `,
                backgroundSize: '52px 52px',
            }} />

            {/* ── Hexágonos parallax ── */}
            {HEXAGONS.map((h, i) => (
                <div key={i} style={{
                    position: 'absolute',
                    left: `${h.x}%`, top: `${h.y}%`,
                    pointerEvents: 'none',
                    ...getParallaxStyle(h.d),
                }}>
                    <div style={{
                        width: h.s, height: h.s,
                        clipPath: 'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)',
                        background: HEX_COLOR[i % 3](h.o),
                        border: `1px solid ${HEX_COLOR[i % 3](h.o * 1.8)}`,
                        animation: `hexFloat ${h.dur} ${h.delay} ease-in-out infinite`,
                    }} />
                </div>
            ))}

            {/* ── Contenido ── */}
            <main style={{
                position: 'relative', zIndex: 10,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '48px 24px',
                opacity: ready ? 1 : 0,
                transition: 'opacity .5s ease',
            }}>

                {/* Badge */}
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: 'rgba(34,211,238,.08)',
                    border: '1px solid rgba(34,211,238,.28)',
                    borderRadius: 999, padding: '7px 20px',
                    fontSize: 11, fontWeight: 700,
                    letterSpacing: '0.22em', textTransform: 'uppercase',
                    color: 'rgba(34,211,238,.9)', marginBottom: 32,
                    fontFamily: "'Orbitron', monospace",
                    animation: 'badgePulse 3s ease-in-out infinite, fadeUp .7s ease both',
                }}>
                    <Sparkles size={13} />
                    Monlau · Aula Inmersiva
                </div>

                {/* Título */}
                <h1 style={{
                    fontFamily: "'Orbitron', monospace",
                    fontSize: 'clamp(52px, 10vw, 96px)',
                    fontWeight: 900, letterSpacing: '0.08em',
                    lineHeight: 1, color: '#fff', textAlign: 'center',
                    animation: 'titleGlow 4s ease-in-out infinite, fadeUp .7s .08s ease both',
                    marginBottom: 12,
                }}>
                    MON<span style={{ color: 'rgb(34,211,238)' }}>GAME</span>
                </h1>

                <p style={{
                    fontSize: 'clamp(12px, 1.5vw, 15px)',
                    color: 'rgba(255,255,255,.35)', letterSpacing: '0.28em',
                    textTransform: 'uppercase', fontWeight: 300,
                    animation: 'fadeUp .7s .14s ease both', marginBottom: 52,
                }}>
                    Gamificación · Inmersión · Aprendizaje
                </p>

                {/* ── Dos portales ── */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: 20, width: '100%', maxWidth: 720,
                    animation: 'fadeUp .7s .22s ease both',
                }}>

                    {/* ─ Portal docente ─ */}
                    <div className="card-t" style={{
                        background: 'rgba(255,255,255,.03)',
                        border: '1px solid rgba(34,211,238,.18)',
                        borderRadius: 24, padding: '36px 32px',
                        display: 'flex', flexDirection: 'column',
                        backdropFilter: 'blur(12px)',
                        boxShadow: '0 8px 32px rgba(0,0,0,.35)',
                        ...px(0.004),
                    }}>
                        <div style={{
                            width: 52, height: 52, borderRadius: 14,
                            background: 'rgba(34,211,238,.1)',
                            border: '1px solid rgba(34,211,238,.22)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: 20,
                        }}>
                            <LogIn size={22} color="rgb(34,211,238)" />
                        </div>

                        <h2 style={{
                            fontFamily: "'Orbitron', monospace",
                            fontSize: 18, fontWeight: 700,
                            color: '#fff', letterSpacing: '0.04em', marginBottom: 10,
                        }}>Soy docente</h2>

                        <p style={{
                            fontSize: 14, lineHeight: 1.75,
                            color: 'rgba(255,255,255,.45)', fontWeight: 300,
                            marginBottom: 28, flexGrow: 1,
                        }}>
                            Accede a tu espacio, prepara actividades,
                            crea sesiones y controla lo que ocurre en clase.
                        </p>

                        <button className="btn-c" onClick={goToLogin} style={{
                            background: 'linear-gradient(135deg, rgb(34,211,238), rgb(6,148,162))',
                            color: '#07091a', border: 'none', borderRadius: 12,
                            padding: '13px 20px', fontSize: 13, fontWeight: 700,
                            fontFamily: "'Orbitron', monospace", letterSpacing: '0.1em',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            boxShadow: '0 4px 18px rgba(34,211,238,.22)', marginBottom: 12,
                        }}>
                            <LogIn size={15} /> Iniciar sesión
                        </button>

                        <button className="lk" onClick={goToRegister} style={{
                            background: 'transparent', border: 'none',
                            color: 'rgba(255,255,255,.32)', fontSize: 13,
                            cursor: 'pointer', fontFamily: 'inherit',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                        }}>
                            Registrarme <ChevronRight size={13} />
                        </button>
                    </div>

                    {/* ─ Portal alumno / PIN ─ */}
                    <div className="card-s" style={{
                        background: 'rgba(255,255,255,.03)',
                        border: '1px solid rgba(251,191,36,.18)',
                        borderRadius: 24, padding: '36px 32px',
                        display: 'flex', flexDirection: 'column',
                        backdropFilter: 'blur(12px)',
                        boxShadow: '0 8px 32px rgba(0,0,0,.35)',
                        ...px(0.007),
                    }}>
                        <div style={{
                            width: 52, height: 52, borderRadius: 14,
                            background: 'rgba(251,191,36,.1)',
                            border: '1px solid rgba(251,191,36,.22)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 24, marginBottom: 20,
                        }}>🎮</div>

                        <h2 style={{
                            fontFamily: "'Orbitron', monospace",
                            fontSize: 18, fontWeight: 700,
                            color: '#fff', letterSpacing: '0.04em', marginBottom: 10,
                        }}>Tengo un PIN</h2>

                        <p style={{
                            fontSize: 14, lineHeight: 1.75,
                            color: 'rgba(255,255,255,.45)', fontWeight: 300,
                            marginBottom: 24, flexGrow: 1,
                        }}>
                            Tu docente te ha dado un código de 6 dígitos.
                            Escríbelo y entra directamente a la sesión.
                        </p>

                        <form onSubmit={handlePinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {error && (
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    background: 'rgba(239,68,68,.08)',
                                    border: '1px solid rgba(239,68,68,.3)',
                                    borderRadius: 12, padding: '10px 14px',
                                    color: 'rgb(252,165,165)', fontSize: 13,
                                }}>
                                    <AlertCircle size={14} style={{ flexShrink: 0 }} />
                                    {error}
                                </div>
                            )}

                            <input
                                className="pin-field"
                                type="text" inputMode="numeric"
                                pattern="[0-9]{6}" maxLength={6}
                                required disabled={loading}
                                value={pin}
                                onChange={(e) => handlePinChange(e.target.value)}
                                placeholder="· · · · · ·"
                                style={{
                                    width: '100%',
                                    background: 'rgba(255,255,255,.04)',
                                    border: '1px solid rgba(251,191,36,.22)',
                                    borderRadius: 14, padding: '14px 16px',
                                    textAlign: 'center',
                                    fontFamily: "'Orbitron', monospace",
                                    fontSize: 28, letterSpacing: '0.45em',
                                    color: '#fcd34d', caretColor: 'rgb(251,191,36)',
                                }}
                            />

                            <button
                                className="btn-a"
                                type="submit"
                                disabled={loading || pin.trim().length !== 6}
                                style={{
                                    background: (loading || pin.trim().length !== 6)
                                        ? 'rgba(251,191,36,.2)'
                                        : 'linear-gradient(135deg, rgb(251,191,36), rgb(217,119,6))',
                                    color: (loading || pin.trim().length !== 6)
                                        ? 'rgba(255,255,255,.25)' : '#07091a',
                                    border: 'none', borderRadius: 12,
                                    padding: '13px 20px', fontSize: 13, fontWeight: 700,
                                    fontFamily: "'Orbitron', monospace", letterSpacing: '0.1em',
                                    cursor: (loading || pin.trim().length !== 6) ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    boxShadow: pin.trim().length === 6 ? '0 4px 18px rgba(251,191,36,.22)' : 'none',
                                }}
                            >
                                {loading
                                    ? <><Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> Conectando...</>
                                    : <><ArrowRight size={15} /> Entrar con PIN</>
                                }
                            </button>
                        </form>
                    </div>

                </div>

                {/* Footer mínimo */}
                <p style={{
                    marginTop: 40, fontSize: 11,
                    color: 'rgba(255,255,255,.15)',
                    letterSpacing: '0.2em', textTransform: 'uppercase',
                    fontFamily: "'Orbitron', monospace",
                    animation: 'fadeUp .7s .35s ease both',
                }}>
                    Monlau · Barcelona · {new Date().getFullYear()}
                </p>

            </main>
        </div>
        </>
    );
}