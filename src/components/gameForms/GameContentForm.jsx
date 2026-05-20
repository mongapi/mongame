import { useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

export const templatesByCode = {
    quiz: {
        questions: [
            {
                id: 'q1',
                text: 'Pregunta de ejemplo',
                timeLimit: 15,
                options: [
                    { id: 'a', text: 'Opcion A' },
                    { id: 'b', text: 'Opcion B' },
                    { id: 'c', text: 'Opcion C' },
                    { id: 'd', text: 'Opcion D' },
                ],
                correctAnswer: 'a',
            },
        ],
    },
    memory: {
        pairs: [
            { id: 'pair-a-1', pairId: 'A', text: 'Concepto' },
            { id: 'pair-a-2', pairId: 'A', text: 'Definicion' },
        ],
    },
    timeline: {
        items: [
            {
                id: 't1',
                text: 'Evento 1',
                date: '1900',
                question: 'Pregunta de ejemplo',
                options: ['Opcion A', 'Opcion B', 'Opcion C'],
                correct: 0,
            },
        ],
    },
    filling_blanks: {
        text: 'La fotosintesis ocurre dentro de los cloroplastos de la planta.',
        hiddenWords: ['cloroplastos', 'planta'],
        options: ['mitocondrias', 'cloroplastos', 'ribosomas', 'animal', 'planta'],
        hint: 'Selecciona la opcion correcta y arrastrala al hueco.',
    },
    guess_who: {
        answer: 'Elemento secreto',
        options: ['Opcion falsa 1', 'Opcion falsa 2', 'Opcion falsa 3'],
        clues: [
            { text: '¿Es de color rojo?', isTrue: true },
            { text: '¿Es un animal?', isTrue: false }
        ],
        maxAttempts: 5,
    },
    shooting: {
        questions: [
            {
                id: 's1',
                text: 'Pregunta de ejemplo',
                options: ['A', 'B', 'C'],
                correct: 0,
            },
        ],
    },
    hangman: {
        word: 'codigo',
        clue: 'Pista del ahorcado',
    },
    orbital: {
        title: 'Sistema Solar de la Nutricion',
        core: 'Nutrientes esenciales',
        orbits: [
            { id: 0, name: 'Macronutrientes', radius: 4.5, color: '#4ade80', speed: 0.5 },
            { id: 1, name: 'Micronutrientes', radius: 7.5, color: '#60a5fa', speed: 0.3 },
            { id: 2, name: 'Hidratacion', radius: 10.5, color: '#c084fc', speed: 0.2 },
        ],
        items: [
            { id: 'i1', text: 'Proteinas', correctOrbit: 0 },
            { id: 'i2', text: 'Vitaminas', correctOrbit: 1 },
            { id: 'i3', text: 'Agua', correctOrbit: 2 },
        ],
    },
    orbital_order: {
        title: 'Sistema Solar de la Nutricion',
        core: 'Nutrientes esenciales',
        orbits: [
            { id: 0, name: 'Macronutrientes', radius: 4.5, color: '#4ade80', speed: 0.5 },
            { id: 1, name: 'Micronutrientes', radius: 7.5, color: '#60a5fa', speed: 0.3 },
            { id: 2, name: 'Hidratacion', radius: 10.5, color: '#c084fc', speed: 0.2 },
        ],
        items: [
            { id: 'i1', text: 'Proteinas', correctOrbit: 0 },
            { id: 'i2', text: 'Vitaminas', correctOrbit: 1 },
            { id: 'i3', text: 'Agua', correctOrbit: 2 },
        ],
    },
};

function cloneTemplate(template) {
    return JSON.parse(JSON.stringify(template));
}

export function getTemplateForGameType(typeCode) {
    return cloneTemplate(templatesByCode[typeCode] ?? { items: [] });
}

function Panel({ title, description, children }) {
    return (
        <section className="rounded-3xl border border-white/10 bg-zinc-950/60 p-5">
            <div className="mb-4">
                <h3 className="text-base font-semibold text-white">{title}</h3>
                {description ? <p className="mt-1 text-sm text-zinc-400">{description}</p> : null}
            </div>
            <div className="space-y-4">{children}</div>
        </section>
    );
}

function Field({ label, hint, children }) {
    return (
        <label className="block space-y-2">
            <span className="block text-sm font-medium text-zinc-300 h-[38px] flex items-end pb-1.5">{label}</span>
            {children}
            {hint ? <span className="block text-xs text-zinc-500">{hint}</span> : null}
        </label>
    );
}

function textInputClassName() {
    return 'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-400';
}

function compactInputClassName() {
    return 'w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400';
}

function updateQuestion(content, questionIndex, updater) {
    const questions = [...(content.questions ?? [])];
    questions[questionIndex] = updater(questions[questionIndex]);
    return { ...content, questions };
}

function updateTimelineItem(content, itemIndex, updater) {
    const items = [...(content.items ?? [])];
    items[itemIndex] = updater(items[itemIndex]);
    return { ...content, items };
}

function updateList(list, index, value) {
    return list.map((item, itemIndex) => (itemIndex === index ? value : item));
}

function getQuestionIdentifier(question, questionIndex, shooting) {
    const currentId = String(question?.id ?? '').trim();
    if (currentId) {
        return currentId;
    }

    return `${shooting ? 's' : 'q'}${questionIndex + 1}`;
}

function withQuestionIdentifiers(content, shooting) {
    const questions = (content.questions ?? []).map((question, questionIndex) => ({
        ...question,
        id: getQuestionIdentifier(question, questionIndex, shooting),
    }));

    return { ...content, questions };
}

function QuestionCard({ title, children, onRemove }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="mb-4 flex items-center justify-between gap-4">
                <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">{title}</h4>
                <button
                    type="button"
                    onClick={onRemove}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-500/20"
                >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                </button>
            </div>
            <div className="space-y-4">{children}</div>
        </div>
    );
}

function QuizForm({ value, onChange, shooting = false }) {
    const questions = value.questions ?? [];

    useEffect(() => {
        const hasMissingIds = questions.some((question, questionIndex) => {
            return getQuestionIdentifier(question, questionIndex, shooting) !== String(question?.id ?? '').trim();
        });

        if (hasMissingIds) {
            onChange(withQuestionIdentifiers(value, shooting));
        }
    }, [onChange, questions, shooting, value]);

    const addQuestion = () => {
        const normalizedValue = withQuestionIdentifiers(value, shooting);
        const normalizedQuestions = normalizedValue.questions ?? [];
        const nextIndex = normalizedQuestions.length + 1;
        const defaultQuestion = shooting
            ? {
                id: `s${nextIndex}`,
                text: `Pregunta ${nextIndex}`,
                options: ['Opcion A', 'Opcion B', 'Opcion C'],
                correct: 0,
            }
            : {
                id: `q${nextIndex}`,
                text: `Pregunta ${nextIndex}`,
                timeLimit: 15,
                options: [
                    { id: 'a', text: 'Opcion A' },
                    { id: 'b', text: 'Opcion B' },
                    { id: 'c', text: 'Opcion C' },
                    { id: 'd', text: 'Opcion D' },
                ],
                correctAnswer: 'a',
            };

        onChange({ ...normalizedValue, questions: [...normalizedQuestions, defaultQuestion] });
    };

    return (
        <Panel
            title={shooting ? 'Preguntas del Shooter' : 'Preguntas del Quiz'}
            description={shooting ? 'Cada pregunta define las opciones y la respuesta correcta para el reto 3D.' : 'Configura en formato docente las preguntas, respuestas y tiempo por ronda.'}
        >
            {questions.map((question, questionIndex) => (
                <QuestionCard
                    key={getQuestionIdentifier(question, questionIndex, shooting)}
                    title={`Pregunta ${questionIndex + 1}`}
                    onRemove={() => onChange({ ...value, questions: questions.filter((_, index) => index !== questionIndex) })}
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <Field label="ID técnico de la pregunta" hint="Se genera automáticamente y se envía al backend para relacionar respuestas, resultados y eventos de sesión.">
                            <input
                                type="text"
                                value={getQuestionIdentifier(question, questionIndex, shooting)}
                                readOnly
                                aria-readonly="true"
                                className={`${textInputClassName()} cursor-not-allowed opacity-70`}
                            />
                        </Field>
                        {!shooting ? (
                            <Field label="Tiempo límite (segundos)">
                                <input
                                    type="number"
                                    min="5"
                                    value={question.timeLimit ?? 15}
                                    onChange={(event) => onChange(updateQuestion(value, questionIndex, (current) => ({ ...current, timeLimit: Number(event.target.value) || 15 })))}
                                    className={textInputClassName()}
                                />
                            </Field>
                        ) : null}
                    </div>

                    <Field label="Pregunta">
                        <textarea
                            rows={3}
                            value={question.text ?? ''}
                            onChange={(event) => onChange(updateQuestion(value, questionIndex, (current) => ({ ...current, text: event.target.value })))}
                            className={textInputClassName()}
                        />
                    </Field>

                    <div className="grid gap-3 md:grid-cols-2">
                        {(question.options ?? []).map((option, optionIndex) => {
                            const optionId = shooting ? optionIndex : option.id;
                            const optionValue = shooting ? option : option.text;

                            return (
                                <div key={shooting ? `option-${optionIndex}` : option.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                                    <div className="mb-2 flex items-center justify-between gap-3">
                                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                                            {shooting ? `Opcion ${optionIndex + 1}` : `Opcion ${option.id}`}
                                        </span>
                                        {shooting ? null : (
                                            <input
                                                type="radio"
                                                name={`correct-answer-${questionIndex}`}
                                                checked={(question.correctAnswer ?? '') === optionId}
                                                onChange={() => onChange(updateQuestion(value, questionIndex, (current) => ({ ...current, correctAnswer: optionId })))}
                                            />
                                        )}
                                    </div>

                                    <input
                                        type="text"
                                        value={optionValue}
                                        onChange={(event) => {
                                            if (shooting) {
                                                const nextOptions = updateList(question.options ?? [], optionIndex, event.target.value);
                                                onChange(updateQuestion(value, questionIndex, (current) => ({ ...current, options: nextOptions })));
                                                return;
                                            }

                                            const nextOptions = (question.options ?? []).map((currentOption, currentIndex) => (
                                                currentIndex === optionIndex
                                                    ? { ...currentOption, text: event.target.value }
                                                    : currentOption
                                            ));

                                            onChange(updateQuestion(value, questionIndex, (current) => ({ ...current, options: nextOptions })));
                                        }}
                                        className={compactInputClassName()}
                                    />

                                    {shooting ? (
                                        <label className="mt-2 flex items-center gap-2 text-xs text-zinc-300">
                                            <input
                                                type="radio"
                                                name={`shooting-correct-${questionIndex}`}
                                                checked={Number(question.correct ?? 0) === optionIndex}
                                                onChange={() => onChange(updateQuestion(value, questionIndex, (current) => ({ ...current, correct: optionIndex })))}
                                            />
                                            Respuesta correcta
                                        </label>
                                    ) : null}
                                </div>
                            );
                        })}
                    </div>
                </QuestionCard>
            ))}

            <button
                type="button"
                onClick={addQuestion}
                className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/20"
            >
                <Plus className="h-4 w-4" />
                Añadir pregunta
            </button>
        </Panel>
    );
}

function MemoryForm({ value, onChange }) {
    const pairs = value.pairs ?? [];
    const groupedPairs = [];

    for (let index = 0; index < pairs.length; index += 2) {
        groupedPairs.push([pairs[index], pairs[index + 1]]);
    }

    const updatePair = (pairIndex, sideIndex, text) => {
        const flatIndex = pairIndex * 2 + sideIndex;
        const nextPairs = pairs.map((item, index) => (index === flatIndex ? { ...item, text } : item));
        onChange({ ...value, pairs: nextPairs });
    };

    const addPair = () => {
        const pairLetter = String.fromCharCode(65 + groupedPairs.length);
        onChange({
            ...value,
            pairs: [
                ...pairs,
                { id: `pair-${pairLetter.toLowerCase()}-1`, pairId: pairLetter, text: 'Concepto' },
                { id: `pair-${pairLetter.toLowerCase()}-2`, pairId: pairLetter, text: 'Definicion' },
            ],
        });
    };

    return (
        <Panel title="Tarjetas del Memory" description="Crea parejas de concepto-definición o término-imagen textual.">
            {groupedPairs.map(([leftCard, rightCard], pairIndex) => (
                <div key={leftCard?.pairId ?? `pair-${pairIndex}`} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="mb-4 flex items-center justify-between gap-4">
                        <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-300">Pareja {leftCard?.pairId ?? pairIndex + 1}</h4>
                        <button
                            type="button"
                            onClick={() => onChange({ ...value, pairs: pairs.filter((_, index) => index !== pairIndex * 2 && index !== pairIndex * 2 + 1) })}
                            className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-500/20"
                        >
                            <Trash2 className="h-4 w-4" />
                            Eliminar
                        </button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Carta A">
                            <input
                                type="text"
                                value={leftCard?.text ?? ''}
                                onChange={(event) => updatePair(pairIndex, 0, event.target.value)}
                                className={textInputClassName()}
                            />
                        </Field>
                        <Field label="Carta B">
                            <input
                                type="text"
                                value={rightCard?.text ?? ''}
                                onChange={(event) => updatePair(pairIndex, 1, event.target.value)}
                                className={textInputClassName()}
                            />
                        </Field>
                    </div>
                </div>
            ))}

            <button
                type="button"
                onClick={addPair}
                className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/20"
            >
                <Plus className="h-4 w-4" />
                Añadir pareja
            </button>
        </Panel>
    );
}

function TimelineForm({ value, onChange }) {
    const items = value.items ?? [];

    const addItem = () => {
        const nextIndex = items.length + 1;
        onChange({
            ...value,
            items: [
                ...items,
                {
                    id: `t${nextIndex}`,
                    text: `Evento ${nextIndex}`,
                    date: '1900',
                    question: 'Pregunta de ejemplo',
                    options: ['Opcion A', 'Opcion B', 'Opcion C'],
                    correct: 0,
                },
            ],
        });
    };

    return (
        <Panel title="Hitos de la cronología" description="Ordena eventos con fecha y una pregunta asociada para cada hito.">
            {items.map((item, itemIndex) => (
                <QuestionCard
                    key={item.id ?? `timeline-item-${itemIndex}`}
                    title={`Hito ${itemIndex + 1}`}
                    onRemove={() => onChange({ ...value, items: items.filter((_, index) => index !== itemIndex) })}
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <Field label="ID del hito">
                            <input
                                type="text"
                                value={item.id ?? ''}
                                onChange={(event) => onChange(updateTimelineItem(value, itemIndex, (current) => ({ ...current, id: event.target.value })))}
                                className={textInputClassName()}
                            />
                        </Field>
                        <Field label="Fecha / periodo">
                            <input
                                type="text"
                                value={item.date ?? ''}
                                onChange={(event) => onChange(updateTimelineItem(value, itemIndex, (current) => ({ ...current, date: event.target.value })))}
                                className={textInputClassName()}
                            />
                        </Field>
                    </div>

                    <Field label="Evento">
                        <input
                            type="text"
                            value={item.text ?? ''}
                            onChange={(event) => onChange(updateTimelineItem(value, itemIndex, (current) => ({ ...current, text: event.target.value })))}
                            className={textInputClassName()}
                        />
                    </Field>

                    <Field label="Pregunta asociada">
                        <textarea
                            rows={2}
                            value={item.question ?? ''}
                            onChange={(event) => onChange(updateTimelineItem(value, itemIndex, (current) => ({ ...current, question: event.target.value })))}
                            className={textInputClassName()}
                        />
                    </Field>

                    <div className="grid gap-3 md:grid-cols-3">
                        {(item.options ?? []).map((option, optionIndex) => (
                            <div key={`timeline-option-${optionIndex}`} className="rounded-xl border border-white/10 bg-white/5 p-3">
                                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                                    <input
                                        type="radio"
                                        name={`timeline-correct-${itemIndex}`}
                                        checked={Number(item.correct ?? 0) === optionIndex}
                                        onChange={() => onChange(updateTimelineItem(value, itemIndex, (current) => ({ ...current, correct: optionIndex })))}
                                    />
                                    Opcion {optionIndex + 1}
                                </div>
                                <input
                                    type="text"
                                    value={option}
                                    onChange={(event) => {
                                        const nextOptions = updateList(item.options ?? [], optionIndex, event.target.value);
                                        onChange(updateTimelineItem(value, itemIndex, (current) => ({ ...current, options: nextOptions })));
                                    }}
                                    className={compactInputClassName()}
                                />
                            </div>
                        ))}
                    </div>
                </QuestionCard>
            ))}

            <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/20"
            >
                <Plus className="h-4 w-4" />
                Añadir hito
            </button>
        </Panel>
    );
}

function FillingBlanksForm({ value, onChange }) {
    const text = value.text ?? value.prompt ?? '';
    const hiddenWords = Array.isArray(value.hiddenWords)
        ? value.hiddenWords
        : (value.hiddenWord ?? value.answer ? [String(value.hiddenWord ?? value.answer)] : []);
    const options = Array.isArray(value.options)
        ? value.options
        : (value.answer ? [String(value.answer)] : []);

    const updateContent = (nextValues) => {
        onChange({
            ...value,
            ...nextValues,
        });
    };

    const updateOption = (optionIndex, nextValue) => {
        updateContent({ options: updateList(options, optionIndex, nextValue) });
    };

    return (
        <Panel title="Completar enunciado" description="Escribe el texto completo, marca las palabras que quieres ocultar y prepara las opciones que el alumnado podrá arrastrar.">
            <Field label="Texto completo" hint="Incluye dentro del texto todas las palabras que quieras ocultar. El juego sustituirá su primera aparición por huecos de arrastre.">
                <textarea
                    rows={5}
                    value={text}
                    onChange={(event) => updateContent({ text: event.target.value })}
                    className={textInputClassName()}
                />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
                <Field label="Pista">
                    <input
                        type="text"
                        value={value.hint ?? ''}
                        onChange={(event) => updateContent({ hint: event.target.value })}
                        className={textInputClassName()}
                    />
                </Field>
                <Field label="Palabras configuradas">
                    <div className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm flex items-center min-h-[48px] box-border">
                        {hiddenWords.length > 0 ? (
                            <span className="text-cyan-400 font-semibold">
                                {hiddenWords.length} palabra{hiddenWords.length === 1 ? '' : 's'} oculta{hiddenWords.length === 1 ? '' : 's'} configurada{hiddenWords.length === 1 ? '' : 's'}.
                            </span>
                        ) : (
                            <span className="text-zinc-500">Todavía no has añadido palabras ocultas.</span>
                        )}
                    </div>
                </Field>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <span className="text-sm font-medium text-zinc-300">Palabras a ocultar</span>
                        <p className="mt-1 text-xs text-zinc-500">Cada palabra debe existir dentro del texto y generará un hueco draggable.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => updateContent({ hiddenWords: [...hiddenWords, `palabra${hiddenWords.length + 1}`] })}
                        className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-400/20"
                    >
                        <Plus className="h-4 w-4" />
                        Añadir palabra
                    </button>
                </div>

                {hiddenWords.map((word, wordIndex) => (
                    <div key={`hidden-word-${wordIndex}`} className="flex items-center gap-3">
                        <input
                            type="text"
                            value={word}
                            onChange={(event) => updateContent({ hiddenWords: updateList(hiddenWords, wordIndex, event.target.value) })}
                            className={textInputClassName()}
                        />
                        <button
                            type="button"
                            onClick={() => updateContent({ hiddenWords: hiddenWords.filter((_, index) => index !== wordIndex) })}
                            className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-red-200 transition hover:bg-red-500/20"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <span className="text-sm font-medium text-zinc-300">Opciones arrastrables</span>
                        <p className="mt-1 text-xs text-zinc-500">Incluye aquí todas las respuestas correctas y los distractores que quieras mostrar al lado.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => updateContent({ options: [...options, `Opcion ${options.length + 1}`] })}
                        className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-400/20"
                    >
                        <Plus className="h-4 w-4" />
                        Añadir opción
                    </button>
                </div>

                {options.map((option, optionIndex) => (
                    <div key={`blank-option-${optionIndex}`} className="flex items-center gap-3">
                        <input
                            type="text"
                            value={option}
                            onChange={(event) => updateOption(optionIndex, event.target.value)}
                            className={textInputClassName()}
                        />
                        <button
                            type="button"
                            onClick={() => updateContent({ options: options.filter((_, index) => index !== optionIndex) })}
                            className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-red-200 transition hover:bg-red-500/20"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>
        </Panel>
    );
}

function GuessWhoForm({ value, onChange }) {
    const clues = value.clues ?? [];
    const options = value.options ?? [];

    return (
        <div className="space-y-5">
            <Panel title="Adivina qué" description="Define la respuesta correcta, opciones falsas y las preguntas/pistas.">
                <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Respuesta correcta">
                        <input
                            type="text"
                            value={value.answer ?? ''}
                            onChange={(event) => onChange({ ...value, answer: event.target.value })}
                            className={textInputClassName()}
                        />
                    </Field>
                    <Field label="Límite de pistas">
                        <input
                            type="number"
                            min="1"
                            value={value.maxAttempts ?? 5}
                            onChange={(event) => onChange({ ...value, maxAttempts: Number(event.target.value) || 5 })}
                            className={textInputClassName()}
                        />
                    </Field>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-zinc-300">Opciones incorrectas (Cartas)</span>
                        <button
                            type="button"
                            onClick={() => onChange({ ...value, options: [...options, `Opción ${options.length + 1}`] })}
                            className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-400/20"
                        >
                            <Plus className="h-4 w-4" />
                            Añadir opción
                        </button>
                    </div>

                    {options.map((option, index) => (
                        <div key={`gw-option-${index}`} className="flex items-center gap-3">
                            <input
                                type="text"
                                value={option}
                                onChange={(event) => onChange({ ...value, options: updateList(options, index, event.target.value) })}
                                className={textInputClassName()}
                            />
                            <button
                                type="button"
                                onClick={() => onChange({ ...value, options: options.filter((_, i) => i !== index) })}
                                className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-red-200 transition hover:bg-red-500/20"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-zinc-300">Preguntas / Pistas</span>
                        <button
                            type="button"
                            onClick={() => onChange({ ...value, clues: [...clues, { text: `Pregunta ${clues.length + 1}`, isTrue: true }] })}
                            className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-400/20"
                        >
                            <Plus className="h-4 w-4" />
                            Añadir pregunta
                        </button>
                    </div>

                    {clues.map((clue, index) => {
                        const clueObj = typeof clue === 'string' ? { text: clue, isTrue: true } : clue;
                        return (
                            <div key={`gw-clue-${index}`} className="flex items-center gap-3">
                                <div className="flex-1 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-2">
                                    <input
                                        type="text"
                                        value={clueObj.text}
                                        onChange={(event) => {
                                            const nextClues = [...clues];
                                            nextClues[index] = { ...clueObj, text: event.target.value };
                                            onChange({ ...value, clues: nextClues });
                                        }}
                                        className="flex-1 bg-transparent px-2 py-1 text-sm text-white outline-none"
                                    />
                                    <label className="flex items-center gap-2 pr-2 text-xs text-zinc-300">
                                        <input
                                            type="checkbox"
                                            checked={clueObj.isTrue}
                                            onChange={(event) => {
                                                const nextClues = [...clues];
                                                nextClues[index] = { ...clueObj, isTrue: event.target.checked };
                                                onChange({ ...value, clues: nextClues });
                                            }}
                                            className="rounded border-white/20 bg-black/50"
                                        />
                                        ¿Es verdad?
                                    </label>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onChange({ ...value, clues: clues.filter((_, i) => i !== index) })}
                                    className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-red-200 transition hover:bg-red-500/20"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </Panel>
        </div>
    );
}

function HangmanForm({ value, onChange }) {
    return (
        <Panel title="Ahorcado" description="Solo necesitas la palabra y una pista para el alumnado.">
            <div className="grid gap-4 md:grid-cols-2">
                <Field label="Palabra">
                    <input
                        type="text"
                        value={value.word ?? ''}
                        onChange={(event) => onChange({ ...value, word: event.target.value })}
                        className={textInputClassName()}
                    />
                </Field>
                <Field label="Pista">
                    <input
                        type="text"
                        value={value.clue ?? ''}
                        onChange={(event) => onChange({ ...value, clue: event.target.value })}
                        className={textInputClassName()}
                    />
                </Field>
            </div>
        </Panel>
    );
}

function OrbitalOrderForm({ value, onChange }) {
    const orbits = value.orbits ?? [];
    const items = value.items ?? [];

    const updateOrbit = (orbitIndex, updater) => {
        const nextOrbits = [...orbits];
        nextOrbits[orbitIndex] = updater(nextOrbits[orbitIndex]);
        onChange({ ...value, orbits: nextOrbits });
    };

    const updateItem = (itemIndex, updater) => {
        const nextItems = [...items];
        nextItems[itemIndex] = updater(nextItems[itemIndex]);
        onChange({ ...value, items: nextItems });
    };

    return (
        <div className="space-y-5">
            <Panel title="Configuracion del sistema" description="Define el nombre del sistema, el nucleo central y las orbitas disponibles.">
                <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Titulo del juego">
                        <input
                            type="text"
                            value={value.title ?? ''}
                            onChange={(event) => onChange({ ...value, title: event.target.value })}
                            className={textInputClassName()}
                        />
                    </Field>
                    <Field label="Nucleo central">
                        <input
                            type="text"
                            value={value.core ?? ''}
                            onChange={(event) => onChange({ ...value, core: event.target.value })}
                            className={textInputClassName()}
                        />
                    </Field>
                </div>
            </Panel>

            <Panel title="Orbitas" description="Cada orbita representa una categoria a la que se asignan los conceptos.">
                <div className="space-y-4">
                    {orbits.map((orbit, orbitIndex) => (
                        <QuestionCard
                            key={orbit.id ?? `orbit-${orbitIndex}`}
                            title={`Orbita ${orbitIndex + 1}`}
                            onRemove={() => onChange({ ...value, orbits: orbits.filter((_, index) => index !== orbitIndex) })}
                        >
                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="ID de orbita">
                                    <input
                                        type="number"
                                        value={orbit.id ?? orbitIndex}
                                        onChange={(event) => updateOrbit(orbitIndex, (current) => ({ ...current, id: Number(event.target.value) }))}
                                        className={textInputClassName()}
                                    />
                                </Field>
                                <Field label="Nombre">
                                    <input
                                        type="text"
                                        value={orbit.name ?? ''}
                                        onChange={(event) => updateOrbit(orbitIndex, (current) => ({ ...current, name: event.target.value }))}
                                        className={textInputClassName()}
                                    />
                                </Field>
                            </div>
                            <div className="grid gap-4 md:grid-cols-[110px_110px_1fr]">
                                <Field label="Radio">
                                    <input
                                        type="number"
                                        min="1"
                                        step="0.1"
                                        value={orbit.radius ?? 4.5}
                                        onChange={(event) => updateOrbit(orbitIndex, (current) => ({ ...current, radius: Number(event.target.value) || 4.5 }))}
                                        className={textInputClassName()}
                                    />
                                </Field>
                                <Field label="Velocidad">
                                    <input
                                        type="number"
                                        min="0.1"
                                        step="0.1"
                                        value={orbit.speed ?? 0.3}
                                        onChange={(event) => updateOrbit(orbitIndex, (current) => ({ ...current, speed: Number(event.target.value) || 0.3 }))}
                                        className={textInputClassName()}
                                    />
                                </Field>
                                <Field label="Color">
                                    <div className="flex items-center gap-3 w-full">
                                        {/* Color picker bubble */}
                                        <div className="relative w-12 h-12 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:border-cyan-400/40 transition-colors shadow-lg">
                                            <input
                                                type="color"
                                                value={orbit.color ?? '#60a5fa'}
                                                onChange={(event) => updateOrbit(orbitIndex, (current) => ({ ...current, color: event.target.value }))}
                                                className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer opacity-100 bg-transparent border-none p-0 [appearance:none] [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-moz-color-swatch]:border-none"
                                            />
                                        </div>
                                        {/* Hex text input */}
                                        <input
                                            type="text"
                                            value={orbit.color ?? '#60a5fa'}
                                            onChange={(event) => updateOrbit(orbitIndex, (current) => ({ ...current, color: event.target.value }))}
                                            className="flex-grow min-w-0 w-full rounded-2xl border border-white/10 bg-white/5 px-2.5 py-3 text-white outline-none transition focus:border-cyan-400 font-mono text-sm uppercase"
                                            placeholder="#60a5fa"
                                        />
                                    </div>
                                </Field>
                            </div>
                        </QuestionCard>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={() => onChange({
                        ...value,
                        orbits: [
                            ...orbits,
                            {
                                id: orbits.length,
                                name: `Orbita ${orbits.length + 1}`,
                                radius: 4.5 + orbits.length * 3,
                                color: '#60a5fa',
                                speed: 0.3,
                            },
                        ],
                    })}
                    className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/20"
                >
                    <Plus className="h-4 w-4" />
                    Anadir orbita
                </button>
            </Panel>

            <Panel title="Conceptos flotantes" description="Asigna cada concepto a la orbita correcta usando su ID.">
                <div className="space-y-4">
                    {items.map((item, itemIndex) => (
                        <QuestionCard
                            key={item.id ?? `orbital-item-${itemIndex}`}
                            title={`Concepto ${itemIndex + 1}`}
                            onRemove={() => onChange({ ...value, items: items.filter((_, index) => index !== itemIndex) })}
                        >
                            <div className="grid gap-4 md:grid-cols-3">
                                <Field label="ID del concepto">
                                    <input
                                        type="text"
                                        value={item.id ?? ''}
                                        onChange={(event) => updateItem(itemIndex, (current) => ({ ...current, id: event.target.value }))}
                                        className={textInputClassName()}
                                    />
                                </Field>
                                <Field label="Texto">
                                    <input
                                        type="text"
                                        value={item.text ?? ''}
                                        onChange={(event) => updateItem(itemIndex, (current) => ({ ...current, text: event.target.value }))}
                                        className={textInputClassName()}
                                    />
                                </Field>
                                <Field label="ID de orbita correcta">
                                    <input
                                        type="number"
                                        value={item.correctOrbit ?? 0}
                                        onChange={(event) => updateItem(itemIndex, (current) => ({ ...current, correctOrbit: Number(event.target.value) }))}
                                        className={textInputClassName()}
                                    />
                                </Field>
                            </div>
                        </QuestionCard>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={() => onChange({
                        ...value,
                        items: [
                            ...items,
                            { id: `i${items.length + 1}`, text: `Concepto ${items.length + 1}`, correctOrbit: orbits[0]?.id ?? 0 },
                        ],
                    })}
                    className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/20"
                >
                    <Plus className="h-4 w-4" />
                    Anadir concepto
                </button>
            </Panel>
        </div>
    );
}

function UnsupportedForm({ value, onChange }) {
    return (
        <Panel title="Contenido estructurado" description="Este tipo todavía no tiene un formulario específico. Puedes seguir ajustándolo con JSON avanzado.">
            <textarea
                rows={16}
                value={JSON.stringify(value, null, 2)}
                onChange={(event) => {
                    try {
                        onChange(JSON.parse(event.target.value));
                    } catch {
                        // Ignore until valid JSON again.
                    }
                }}
                className="w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-4 font-mono text-sm text-cyan-100 outline-none transition focus:border-cyan-400"
            />
        </Panel>
    );
}

export default function GameContentForm({ typeCode, value, onChange }) {
    if (typeCode === 'quiz') {
        return <QuizForm value={value} onChange={onChange} />;
    }

    if (typeCode === 'shooting') {
        return <QuizForm value={value} onChange={onChange} shooting />;
    }

    if (typeCode === 'memory') {
        return <MemoryForm value={value} onChange={onChange} />;
    }

    if (typeCode === 'timeline') {
        return <TimelineForm value={value} onChange={onChange} />;
    }

    if (typeCode === 'filling_blanks') {
        return <FillingBlanksForm value={value} onChange={onChange} />;
    }

    if (typeCode === 'guess_who') {
        return <GuessWhoForm value={value} onChange={onChange} />;
    }

    if (typeCode === 'hangman') {
        return <HangmanForm value={value} onChange={onChange} />;
    }

    if (typeCode === 'orbital' || typeCode === 'orbital_order') {
        return <OrbitalOrderForm value={value} onChange={onChange} />;
    }

    return <UnsupportedForm value={value} onChange={onChange} />;
}