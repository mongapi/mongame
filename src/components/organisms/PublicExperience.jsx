import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

export function Reveal({ children, delay = 0, className = '' }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, amount: 0.2 });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay, ease: 'easeOut' }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function SectionIntro({ eyebrow, title, description }) {
    return (
        <div>
            {eyebrow ? <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">{eyebrow}</p> : null}
            <h2 className="mt-3 font-['Orbitron'] text-4xl font-black text-white">{title}</h2>
            {description ? <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">{description}</p> : null}
        </div>
    );
}

export function MetricStrip({ items }) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            {items.map((item) => (
                <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                    <p className="text-2xl font-black text-white">{item.value}</p>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">{item.label}</p>
                </div>
            ))}
        </div>
    );
}

export function EntryCard({ icon: Icon, title, description, primaryLabel, onPrimary, secondaryLabel, onSecondary, accent = 'cyan', children }) {
    const accentStyles = accent === 'amber'
        ? {
            icon: 'border-amber-300/20 bg-amber-300/10 text-amber-200',
            primary: 'bg-amber-300 text-zinc-950 hover:bg-amber-200',
        }
        : {
            icon: 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100',
            primary: 'bg-cyan-300 text-zinc-950 hover:bg-cyan-200',
        };

    return (
        <div className="rounded-[2rem] border border-white/10 bg-zinc-950/60 p-8 backdrop-blur-xl">
            <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border ${accentStyles.icon}`}>
                <Icon className="h-6 w-6" />
            </div>
            <h3 className="font-['Orbitron'] text-3xl font-black text-white">{title}</h3>
            <p className="mt-4 text-sm leading-7 text-zinc-400">{description}</p>
            {children ? <div className="mt-6">{children}</div> : null}
            <div className="mt-8 flex flex-wrap gap-3">
                <button
                    type="button"
                    onClick={onPrimary}
                    className={`rounded-2xl px-5 py-3 font-bold transition ${accentStyles.primary}`}
                >
                    {primaryLabel}
                </button>
                {secondaryLabel && onSecondary ? (
                    <button
                        type="button"
                        onClick={onSecondary}
                        className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 font-bold text-white transition hover:bg-white/10"
                    >
                        {secondaryLabel}
                    </button>
                ) : null}
            </div>
        </div>
    );
}

export function StepListCard({ eyebrow, title, badge, steps }) {
    return (
        <div className="relative w-full overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950/75 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">{eyebrow}</p>
                    <h2 className="mt-2 font-['Orbitron'] text-2xl font-black text-white">{title}</h2>
                </div>
                {badge ? (
                    <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-200">
                        {badge}
                    </div>
                ) : null}
            </div>

            <div className="space-y-4">
                {steps.map((item, index) => (
                    <motion.div
                        key={`${item.step}-${item.title}`}
                        initial={{ opacity: 0, x: 18 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.24 + index * 0.08, duration: 0.45 }}
                        className="flex gap-4 rounded-3xl border border-white/10 bg-white/3 p-4"
                    >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-300/10 font-['Orbitron'] text-sm font-black text-cyan-100">
                            {item.step}
                        </div>
                        <div>
                            <p className="font-semibold text-white">{item.title}</p>
                            <p className="mt-1 text-sm leading-6 text-zinc-400">{item.description}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

export function FeatureGrid({ items }) {
    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {items.map((item, index) => {
                const Icon = item.icon;

                return (
                    <Reveal key={item.title} delay={index * 0.08}>
                        <div className="h-full rounded-[2rem] border border-white/10 bg-white/4 p-7 backdrop-blur-xl">
                            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
                                <Icon className="h-6 w-6" />
                            </div>
                            <h3 className="font-['Orbitron'] text-2xl font-black text-white">{item.title}</h3>
                            <p className="mt-4 text-sm leading-7 text-zinc-400">{item.description}</p>
                        </div>
                    </Reveal>
                );
            })}
        </div>
    );
}

export function CalloutBanner({ eyebrow, title, description, primaryLabel, onPrimary, secondaryLabel, onSecondary }) {
    return (
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.25rem] border border-white/10 bg-linear-to-br from-cyan-300/10 via-zinc-950/90 to-amber-300/10 p-10 md:p-14">
            <div className="absolute -left-16 top-8 h-48 w-48 rounded-full bg-cyan-300/15 blur-[80px]" />
            <div className="absolute -bottom-20 right-0 h-56 w-56 rounded-full bg-amber-300/10 blur-[90px]" />
            <div className="relative z-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-100">{eyebrow}</p>
                    <h2 className="mt-4 font-['Orbitron'] text-4xl font-black text-white md:text-5xl">{title}</h2>
                </div>
                <div className="space-y-4">
                    <div className="rounded-3xl border border-white/10 bg-white/4 p-5 text-sm leading-7 text-zinc-300">
                        {description}
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={onPrimary}
                            className="rounded-2xl bg-cyan-300 px-5 py-3 font-bold text-zinc-950 transition hover:bg-cyan-200"
                        >
                            {primaryLabel}
                        </button>
                        {secondaryLabel && onSecondary ? (
                            <button
                                type="button"
                                onClick={onSecondary}
                                className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 font-bold text-white transition hover:bg-white/10"
                            >
                                {secondaryLabel}
                            </button>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}