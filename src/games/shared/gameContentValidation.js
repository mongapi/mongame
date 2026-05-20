export function validateGameContent(typeCode, gameContent) {
    if (typeCode === 'quiz') {
        const questions = gameContent?.questions;
        if (!Array.isArray(questions) || questions.length === 0) {
            return 'Añade al menos una pregunta al quiz.';
        }

        const firstInvalidQuestion = questions.find((question) => (
            !question?.text || !Array.isArray(question.options) || question.options.length < 2 || !question.correctAnswer
        ));

        if (firstInvalidQuestion) {
            return 'Todas las preguntas del quiz deben tener texto, mínimo dos opciones y una respuesta correcta.';
        }

        return '';
    }

    if (typeCode === 'shooting') {
        const questions = gameContent?.questions;
        if (!Array.isArray(questions) || questions.length === 0) {
            return 'Añade al menos una pregunta al shooter.';
        }

        const firstInvalidQuestion = questions.find((question) => (
            !question?.text || !Array.isArray(question.options) || question.options.length < 2 || Number.isNaN(Number(question.correct))
        ));

        if (firstInvalidQuestion) {
            return 'Todas las preguntas del shooter deben tener texto, opciones y un índice de respuesta correcta.';
        }

        return '';
    }

    if (typeCode === 'memory') {
        const pairs = gameContent?.pairs;
        if (!Array.isArray(pairs) || pairs.length < 2 || pairs.length % 2 !== 0) {
            return 'El memory necesita al menos una pareja completa de cartas.';
        }

        const pairCounts = pairs.reduce((accumulator, card) => {
            const pairId = card?.pairId;
            if (!pairId || !card?.text) {
                accumulator.invalid = true;
                return accumulator;
            }

            accumulator[pairId] = (accumulator[pairId] ?? 0) + 1;
            return accumulator;
        }, {});

        if (pairCounts.invalid || Object.values(pairCounts).some((count) => count !== 2)) {
            return 'Cada pareja del memory debe tener exactamente dos cartas con texto.';
        }

        return '';
    }

    if (typeCode === 'filling_blanks') {
        const text = String(gameContent?.text ?? gameContent?.prompt ?? '').trim();
        const hiddenWords = Array.isArray(gameContent?.hiddenWords)
            ? gameContent.hiddenWords.map((word) => String(word ?? '').trim()).filter(Boolean)
            : [String(gameContent?.hiddenWord ?? gameContent?.answer ?? '').trim()].filter(Boolean);
        const options = Array.isArray(gameContent?.options)
            ? gameContent.options.map((option) => String(option ?? '').trim()).filter(Boolean)
            : [];

        if (!text || hiddenWords.length === 0) {
            return 'Completar enunciado necesita un texto completo y al menos una palabra oculta.';
        }

        const normalizedText = text.toLowerCase();
        const missingWord = hiddenWords.find((word) => !normalizedText.includes(word.toLowerCase()) && !text.includes('___'));
        if (missingWord) {
            return 'Cada palabra a ocultar debe aparecer dentro del texto completo.';
        }

        if (new Set(hiddenWords.map((word) => word.toLowerCase())).size !== hiddenWords.length) {
            return 'No repitas la misma palabra oculta varias veces.';
        }

        if (Array.isArray(gameContent?.options)) {
            if (options.length < 2) {
                return 'Añade al menos dos opciones arrastrables para completar el enunciado.';
            }

            const missingOption = hiddenWords.find((word) => !options.some((option) => option.toLowerCase() === word.toLowerCase()));
            if (missingOption) {
                return 'Todas las palabras ocultas deben existir también entre las opciones arrastrables.';
            }
        }

        return '';
    }

    if (typeCode === 'guess_who') {
        if (!gameContent?.answer || !Array.isArray(gameContent?.clues) || gameContent.clues.length === 0) {
            return 'Adivina qué necesita una respuesta y al menos una pista.';
        }
        
        if (!Array.isArray(gameContent?.options) || gameContent.options.length === 0) {
            return 'Adivina qué necesita al menos una opción falsa para las cartas.';
        }

        return '';
    }

    if (typeCode === 'timeline') {
        const items = gameContent?.items;
        if (!Array.isArray(items) || items.length === 0) {
            return 'La cronología necesita al menos un hito.';
        }

        const invalidItem = items.find((item) => (
            !item?.text || !item?.date || !item?.question || !Array.isArray(item.options) || item.options.length < 2 || Number.isNaN(Number(item.correct))
        ));

        if (invalidItem) {
            return 'Cada hito debe tener evento, fecha, pregunta, opciones y respuesta correcta.';
        }

        return '';
    }

    if (typeCode === 'hangman') {
        if (!gameContent?.word || !gameContent?.clue) {
            return 'El ahorcado necesita una palabra y una pista.';
        }

        return '';
    }

    if (typeCode === 'orbital' || typeCode === 'orbital_order') {
        if (!gameContent?.title || !gameContent?.core) {
            return 'Orbital Order necesita un titulo y un nucleo central.';
        }

        const orbits = gameContent?.orbits;
        const items = gameContent?.items;

        if (!Array.isArray(orbits) || orbits.length === 0) {
            return 'Orbital Order necesita al menos una orbita.';
        }

        if (!Array.isArray(items) || items.length === 0) {
            return 'Orbital Order necesita al menos un concepto.';
        }

        const orbitIds = new Set();
        const invalidOrbit = orbits.find((orbit) => {
            const orbitId = Number(orbit?.id);
            if (!orbit?.name || !Number.isFinite(orbitId) || orbitIds.has(orbitId) || !Number.isFinite(Number(orbit?.radius))) {
                return true;
            }

            orbitIds.add(orbitId);
            return false;
        });

        if (invalidOrbit) {
            return 'Cada orbita debe tener un ID unico, nombre y radio valido.';
        }

        const invalidItem = items.find((item) => {
            return !item?.id || !item?.text || !orbitIds.has(Number(item?.correctOrbit));
        });

        if (invalidItem) {
            return 'Cada concepto debe tener ID, texto y una orbita correcta existente.';
        }

        return '';
    }

    return '';
}