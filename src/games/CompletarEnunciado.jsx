import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, RotateCcw, Sparkles } from 'lucide-react';
import { sessionAPI } from '@/api/api';
import { GameErrorState, GameLoadingState } from '@/games/shared/GameScreenShell';
import { useSessionGame } from '@/hooks/useSessionGame';
import { validateGameContent } from '@/games/shared/gameContentValidation';

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getHiddenWords(gameContent) {
    const hiddenWords = Array.isArray(gameContent?.hiddenWords)
        ? gameContent.hiddenWords
        : [gameContent?.hiddenWord ?? gameContent?.answer];

    return hiddenWords
        .map((word) => String(word ?? '').trim())
        .filter(Boolean);
}

function splitTextAroundHiddenWords(text, hiddenWords) {
    if (text.includes('___')) {
        return text.split('___');
    }

    if (hiddenWords.length === 0) {
        return [text];
    }

    const parts = [];
    let remainingText = text;

    hiddenWords.forEach((hiddenWord) => {
        const pattern = new RegExp(escapeRegExp(hiddenWord), 'i');
        const match = remainingText.match(pattern);

        if (!match || match.index == null) {
            parts.push(remainingText);
            remainingText = '';
            return;
        }

        const start = match.index;
        const end = start + match[0].length;
        parts.push(remainingText.slice(0, start));
        remainingText = remainingText.slice(end);
    });

    parts.push(remainingText);
    return parts;
}

function ensureOptionsContainAnswers(options, hiddenWords) {
    const normalizedOptions = [...options];

    hiddenWords.forEach((hiddenWord) => {
        if (!normalizedOptions.some((option) => option.toLowerCase() === hiddenWord.toLowerCase())) {
            normalizedOptions.push(hiddenWord);
        }
    });

    return normalizedOptions;
}

function buildBlankMappings(options, hiddenWords) {
    return hiddenWords.map((hiddenWord, index) => {
        const correctOptionIndex = options.findIndex((option) => option.toLowerCase() === hiddenWord.toLowerCase());

        return {
            id: `b${index + 1}`,
            correctAnswer: correctOptionIndex >= 0 ? `o${correctOptionIndex + 1}` : '',
        };
    });
}

function hasMissingParts(parts, hiddenWords) {
    return !parts.length || parts.length !== hiddenWords.length + 1;
}

function splitLegacyText(text, hiddenWords) {
    if (hiddenWords.length === 0) {
        return [text, ''];
    }

    return [text, ''];
}

function buildBlankData(gameContent) {
    const text = String(gameContent?.text ?? gameContent?.prompt ?? '');
    const hiddenWords = getHiddenWords(gameContent);
    const rawOptions = Array.isArray(gameContent?.options)
        ? gameContent.options
        : hiddenWords;
    const normalizedOptions = ensureOptionsContainAnswers(
        rawOptions
        .map((option) => String(option ?? '').trim())
        .filter(Boolean)
        .filter((option, index, list) => list.findIndex((item) => item.toLowerCase() === option.toLowerCase()) === index),
        hiddenWords,
    );
    const splitParts = splitTextAroundHiddenWords(text, hiddenWords);
    const textParts = hasMissingParts(splitParts, hiddenWords)
        ? splitLegacyText(text, hiddenWords)
        : splitParts;
    const blanks = buildBlankMappings(normalizedOptions, hiddenWords);

    const options = normalizedOptions.map((option, index) => ({
        id: `o${index + 1}`,
        text: option,
    }));

    return {
        title: gameContent?.title ?? 'Completa el enunciado',
        instruction: gameContent?.hint || 'Arrastra los términos correctos a los huecos para completar el texto.',
        textParts,
        blanks,
        options,
    };
}

export default function CompletarEnunciado() {
    const { content, sessionId, participant, isLoading, error, setError } = useSessionGame({
        resolveContent: (gameContent) => gameContent ?? {},
        validateContent: (gameContent) => validateGameContent('filling_blanks', gameContent),
    });

    const levelData = useMemo(() => buildBlankData(content), [content]);
    const [filledBlanks, setFilledBlanks] = useState({});
    const [status, setStatus] = useState('playing'); // playing, error, success
    const [startedAt, setStartedAt] = useState(() => Date.now());
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setFilledBlanks({});
        setStatus('playing');
        setStartedAt(Date.now());
        setError('');
    }, [content, setError]);

    if (isLoading) {
        return <GameLoadingState title="Cargando ejercicio de completar..." />;
    }

    if (error || levelData.blanks.length === 0) {
        return <GameErrorState message={error || 'El ejercicio no tiene huecos configurados todavía.'} />;
    }

    const handleDragStart = (e, optionId, sourceBlankId = null) => {
        e.dataTransfer.setData("optionId", optionId);
        if (sourceBlankId) {
            e.dataTransfer.setData("sourceBlankId", sourceBlankId);
        }
        setTimeout(() => {
            if (e.target) e.target.style.opacity = '0.4';
        }, 0);
    };

    const handleDragEnd = (e) => {
        if (e.target) e.target.style.opacity = '1';
    };

    const handleDropOnBlank = (e, blankId) => {
        e.preventDefault();
        if (status === 'success') return;
        
        const optionId = e.dataTransfer.getData("optionId");
        if (!optionId) return;

        const newFilledBlanks = { ...filledBlanks };
        
        // Remove from its previous blank if it was in one
        Object.keys(newFilledBlanks).forEach(key => {
            if (newFilledBlanks[key] === optionId) {
                delete newFilledBlanks[key];
            }
        });
        
        // Add to the new blank
        newFilledBlanks[blankId] = optionId;
        
        setFilledBlanks(newFilledBlanks);
        if (status === 'error') setStatus('playing');
    };

    const handleDropOnPool = (e) => {
        e.preventDefault();
        if (status === 'success') return;

        const optionId = e.dataTransfer.getData("optionId");
        if (!optionId) return;

        const newFilledBlanks = { ...filledBlanks };
        
        // Remove the option from any blank it currently occupies
        Object.keys(newFilledBlanks).forEach(key => {
            if (newFilledBlanks[key] === optionId) {
                delete newFilledBlanks[key];
            }
        });
        
        setFilledBlanks(newFilledBlanks);
        if (status === 'error') setStatus('playing');
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleCheck = async () => {
        let isAllCorrect = true;
        let isComplete = true;

        const submittedWords = levelData.blanks
            .map((blank) => {
                const optionId = filledBlanks[blank.id];
                return levelData.options.find((option) => option.id === optionId)?.text ?? '';
            })
            .filter(Boolean);

        levelData.blanks.forEach(blank => {
            if (!filledBlanks[blank.id]) {
                isComplete = false;
                isAllCorrect = false;
            } else if (filledBlanks[blank.id] !== blank.correctAnswer) {
                isAllCorrect = false;
            }
        });

        if (sessionId && !isSubmitting) {
            setIsSubmitting(true);
            const result = await sessionAPI.submitAnswer(sessionId, {
                question_id: 'fill-blanks',
                answer: submittedWords,
                device_id: participant.deviceId,
                player_name: participant.playerName,
                player_number: 1,
                elapsed_seconds: Math.max(0, Math.round((Date.now() - startedAt) / 1000)),
                completed: isAllCorrect,
            });

            if (!result.success) {
                setError(result.error);
            }

            setIsSubmitting(false);
        }

        if (!isComplete && !isAllCorrect) {
             setStatus('error');
             return;
        }

        if (isAllCorrect) {
            setStatus('success');
        } else {
            setStatus('error');
        }
    };

    const handleReset = () => {
        setFilledBlanks({});
        setStatus('playing');
        setStartedAt(Date.now());
        setError('');
    };

    const getAvailableOptions = () => {
        const usedOptionIds = Object.values(filledBlanks);
        return levelData.options.filter(opt => !usedOptionIds.includes(opt.id));
    };

    return (
        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-4 font-sans text-stone-100 selection:bg-indigo-500/30">
            {/* Background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-zinc-950">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[120px]" />
                <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-900/10 blur-[100px]" />
            </div>

            <div className="relative z-10 w-full max-w-5xl rounded-[2.5rem] border border-white/5 bg-white/2 p-8 shadow-2xl backdrop-blur-3xl sm:p-12">
                <div className="mb-12 text-center">
                    <h1 className="mb-4 flex items-center justify-center gap-4 bg-linear-to-r from-indigo-300 via-purple-300 to-indigo-300 bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl">
                        <Sparkles className="w-8 h-8 text-indigo-400" />
                        {levelData.title}
                        <Sparkles className="w-8 h-8 text-purple-400" />
                    </h1>
                    <p className="text-lg text-zinc-400 font-medium">
                        {levelData.instruction}
                    </p>
                </div>

                <div className="mb-12 rounded-3xl border border-white/5 bg-black/40 p-8 shadow-[inset_0_0_40px_rgba(0,0,0,0.5)] sm:p-12">
                    <p className="text-center text-2xl font-medium leading-14 text-zinc-200 sm:leading-16">
                        {levelData.textParts.map((part, index) => {
                            const blank = levelData.blanks[index];

                            return (
                                <React.Fragment key={`part-${index}`}>
                                    <span>{part}</span>
                                    {blank ? (
                                        <BlankDropzone
                                            blankId={blank.id}
                                            filledOptionId={filledBlanks[blank.id]}
                                            options={levelData.options}
                                            onDrop={handleDropOnBlank}
                                            onDragOver={handleDragOver}
                                            onDragStart={handleDragStart}
                                            onDragEnd={handleDragEnd}
                                            status={status}
                                            correctAnswer={blank.correctAnswer}
                                        />
                                    ) : null}
                                </React.Fragment>
                            );
                        })}
                    </p>
                </div>

                {/* Options Pool */}
                <div 
                    className="mb-10 flex min-h-40 items-center justify-center rounded-3xl border border-zinc-800/60 bg-zinc-900/40 p-8 shadow-inner transition-colors duration-300"
                    onDrop={handleDropOnPool}
                    onDragOver={handleDragOver}
                >
                    <div className="flex flex-wrap justify-center gap-5 w-full">
                        <AnimatePresence>
                            {getAvailableOptions().map(option => (
                                <DraggableOption
                                    key={option.id}
                                    option={option}
                                    onDragStart={handleDragStart}
                                    onDragEnd={handleDragEnd}
                                    disabled={status === 'success'}
                                />
                            ))}
                        </AnimatePresence>
                        {getAvailableOptions().length === 0 && (
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                className="text-zinc-500 font-medium flex items-center h-full text-lg"
                            >
                                {status === 'success' ? '¡Todo completado!' : 'No quedan más términos. ¡Comprueba tu respuesta!'}
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Controls */}
                <div className="flex min-h-25 flex-col items-center gap-8">
                    <AnimatePresence mode="wait">
                        {status !== 'success' ? (
                            <motion.button
                                key="check-button"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                onClick={handleCheck}
                                disabled={Object.keys(filledBlanks).length === 0}
                                className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-2xl bg-indigo-600 px-10 py-5 font-bold text-white transition-all hover:bg-indigo-500 hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-[0_0_40px_rgba(79,70,229,0.3)]"
                            >
                                <span className="relative z-10 flex items-center gap-3 text-lg">
                                    Comprobar Respuesta <CheckCircle2 className="w-6 h-6" />
                                </span>
                                <div className="absolute inset-0 z-0 bg-linear-to-r from-indigo-500 to-purple-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                            </motion.button>
                        ) : (
                            <motion.div 
                                key="success-state"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center gap-6"
                            >
                                <div className="flex items-center gap-3 text-emerald-400 font-bold text-2xl bg-emerald-400/10 px-8 py-4 rounded-2xl border border-emerald-400/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                                    <CheckCircle2 className="w-8 h-8" />
                                    ¡Excelente! Respuesta correcta.
                                </div>
                                <button
                                    onClick={handleReset}
                                    className="group flex items-center gap-2 text-zinc-400 font-medium hover:text-white transition-colors"
                                >
                                    <RotateCcw className="w-5 h-5 transition-transform group-hover:-rotate-180 duration-500" /> 
                                    <span className="underline underline-offset-4 decoration-zinc-700 group-hover:decoration-white/50">Volver a jugar</span>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {status === 'error' && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-3 text-rose-400 font-semibold text-lg bg-rose-500/10 px-6 py-3 rounded-xl border border-rose-500/20"
                            >
                                <XCircle className="w-6 h-6" />
                                Algunos términos son incorrectos.
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

function BlankDropzone({ blankId, filledOptionId, options, onDrop, onDragOver, onDragStart, onDragEnd, status, correctAnswer }) {
    const filledOption = filledOptionId ? options.find(o => o.id === filledOptionId) : null;
    
    let stateStyles = "border-dashed border-zinc-700 bg-black/20 text-transparent";
    
    if (filledOption) {
        stateStyles = "border-solid border-indigo-500/50 bg-indigo-500/10 text-indigo-200 shadow-[0_0_20px_rgba(99,102,241,0.15)]";
        
        if (status === 'success') {
             stateStyles = "border-solid border-emerald-500/50 bg-emerald-500/10 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.15)]";
        } else if (status === 'error') {
             if (filledOptionId === correctAnswer) {
                 stateStyles = "border-solid border-emerald-500/50 bg-emerald-500/10 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.15)]";
             } else {
                 stateStyles = "border-solid border-rose-500/50 bg-rose-500/10 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.15)]";
             }
        }
    }

    return (
        <span
            onDrop={(e) => onDrop(e, blankId)}
            onDragOver={onDragOver}
            className={`
                relative inline-flex items-center justify-center
                mx-3 min-w-40 px-5 py-2 align-middle
                border-2 rounded-xl transition-all duration-300
                ${stateStyles}
                ${!filledOption && status !== 'success' ? "hover:border-indigo-500/50 hover:bg-white/3" : ""}
            `}
        >
            {filledOption ? (
                <span
                    draggable={status !== 'success'} // Prevent dragging when success
                    onDragStart={(e) => onDragStart(e, filledOption.id, blankId)}
                    onDragEnd={onDragEnd}
                    className={`
                        absolute inset-0 flex items-center justify-center font-bold tracking-wide w-full h-full rounded-xl
                        ${status !== 'success' ? 'cursor-grab active:cursor-grabbing hover:bg-white/5' : ''}
                    `}
                >
                    {filledOption.text}
                </span>
            ) : (
                <span className="invisible text-lg">_</span>
            )}
        </span>
    );
}

function DraggableOption({ option, onDragStart, onDragEnd, disabled }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            draggable={!disabled}
            onDragStart={(e) => onDragStart(e, option.id)}
            onDragEnd={onDragEnd}
            className={`
                px-7 py-3.5 rounded-xl font-bold tracking-wide text-lg shadow-xl
                ${disabled 
                    ? 'opacity-50 cursor-not-allowed bg-zinc-800/80 text-zinc-500 border border-zinc-700/50' 
                    : 'cursor-grab active:cursor-grabbing border border-indigo-400/30 bg-linear-to-br from-indigo-500 to-violet-600 text-white transition-transform hover:-translate-y-1 hover:scale-105 hover:shadow-[0_10px_20px_rgba(99,102,241,0.3)]'}
            `}
        >
            {option.text}
        </motion.div>
    );
}
