export const ROUTE_PATHS = {
    home: '/',
    about: '/about',
    login: '/login',
    register: '/register',
    join: '/join',
    dashboard: '/dashboard',
    dashboardSession: '/dashboard/:sessionId',
    config: '/config',
    games: '/games',
    gamesCreate: '/games/create',
    gameCreateByType: '/games/create/:type',
    gameEdit: '/games/:id/edit',
    lessonPlansCreate: '/lesson-plans/create',
    lessonPlanEdit: '/lesson-plans/:id/edit',
    sessionsCreate: '/sessions/create',
    sessionCreateByType: '/sessions/create/:type',
    adminDashboard: '/admin/dashboard',
    playMemory: '/jugar/memory',
    playMemory3D: '/jugar/memory3d',
    playQuiz: '/jugar/quiz',
    playFillingBlanks: '/jugar/completar',
    playTimeline: '/jugar/cronologias',
    playShooter: '/jugar/shooter',
    playGuessWho: '/jugar/adivina',
    playHangman: '/jugar/ahorcado',
    playOrbital: '/jugar/orbital',
    fallback: '*',
};

export const PLAY_ROUTE_BY_GAME_TYPE = {
    memory: ROUTE_PATHS.playMemory,
    memory3d: ROUTE_PATHS.playMemory3D,
    quiz: ROUTE_PATHS.playQuiz,
    timeline: ROUTE_PATHS.playTimeline,
    filling_blanks: ROUTE_PATHS.playFillingBlanks,
    guess_who: ROUTE_PATHS.playGuessWho,
    shooting: ROUTE_PATHS.playShooter,
    hangman: ROUTE_PATHS.playHangman,
    orbital: ROUTE_PATHS.playOrbital,
    orbital_order: ROUTE_PATHS.playOrbital,
};

export function resolvePlayRouteByGameType(typeCode) {
    return PLAY_ROUTE_BY_GAME_TYPE[typeCode] ?? null;
}

export function buildDashboardSessionPath(sessionId) {
    return `${ROUTE_PATHS.dashboard}/${sessionId}`;
}

export function buildGameEditPath(gameId) {
    return `${ROUTE_PATHS.games}/${gameId}/edit`;
}

export function buildGameCreateTypePath(type) {
    return `${ROUTE_PATHS.gamesCreate}/${type}`;
}

export function buildLessonPlanEditPath(lessonPlanId) {
    return `/lesson-plans/${lessonPlanId}/edit`;
}

export function buildSessionCreateTypePath(type) {
    return `${ROUTE_PATHS.sessionsCreate}/${type}`;
}