import axios from 'axios';

function readSessionPin() {
    if (typeof window === 'undefined') {
        return '';
    }

    return new URLSearchParams(window.location.search).get('pin') || '';
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'; //CONFIGURACIÓN BASE DE AXIOS


/**
 * El interceptor de solicitud (request interceptor) se ejecuta **cada vez**
 * que estás a punto de enviar una petición.
 */
const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

/**
 * INTERCEPTOR PARA AGREGAR TOKEN AUTOMÁTICAMENTE
 * Su trabajo es "enganchar" el token en el encabezado Authorization antes de que
 * la petición salga hacia Laravel.
 */
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

/**
 * INTERCEPTOR PARA MANEJAR RESPUESTAS Y ERRORES
 * Se ejecuta cada vez que recibes una respuesta del servidor (sea éxito o error).
 */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Si el token expiró, redirigir al login
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// FUNCIONES DE AUTENTICACIÓN 
export const authAPI = {

    /**
     * Función que permite el inicio de sesión
     * @param {*} credentials - Email y contraseña
     * @returns Objeto con token y usuario si es exitoso, o error si falla
     */
    async login(credentials) {
        try {
            const response = await api.post('/auth/login', credentials);
            const { token, user } = response.data;

            // Guardar token y usuario en localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            return { success: true, data: { token, user } };
        } catch (error) {
            const message = error.response?.data?.message || 'Error de conexión';
            return { success: false, error: message };
        }
    },

    /**
     * Función que permite el registro de un nuevo usuario
     * @param {*} userData - Datos del usuario
     * @returns Objeto con token y usuario si es exitoso, o error si falla
     */
    async register(userData) {
        try {
            const response = await api.post('/auth/register', userData);
            const { token, user } = response.data;

            // Guardar token y usuario en localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            return { success: true, data: { token, user } };
        } catch (error) {
            const message = error.response?.data?.message || 'Error de conexión';
            return { success: false, error: message };
        }
    },

    /**
     * Función que permite cerrar sesión
     * Elimina el token y el usuario del localStorage
     */
    async logout() {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.log('Error al cerrar sesión:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    },

    /**
     * Función que permite verificar si el usuario está autenticado
     * @returns Booleano que indica si el usuario está autenticado
     */
    isAuthenticated() {
        return !!localStorage.getItem('token');
    },

    /**
     * Función que permite obtener el usuario actual
     * @returns Objeto con el usuario actual
     */
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }
};

// FUNCIONES DE SESIONES

export const sessionAPI = {

    /**
     * Función que permite listar las sesiones
     * @returns Objeto con éxito si es exitoso, o error si falla
     */
    async list() {
        try {
            const response = await api.get('/sessions');
            return { success: true, data: response.data.data ?? [] };
        } catch (error) {
            const message = error.response?.data?.message || 'No se pudieron cargar las sesiones';
            return { success: false, error: message };
        }
    },

    /**
     * Función que permite obtener una sesión específica
     * @param {*} id - ID de la sesión
     * @returns Objeto con éxito si es exitoso, o error si falla
     */
    async get(id) {
        try {
            const pin = readSessionPin();
            const response = await api.get(`/sessions/${id}`, {
                params: pin ? { pin } : undefined,
            });
            return { success: true, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'No se pudo cargar la sesión';
            return { success: false, error: message };
        }
    },

    /**
     * Función que permite obtener los resultados de una sesión específica
     * @param {*} id - ID de la sesión
     * @returns Objeto con éxito si es exitoso, o error si falla
     */
    async results(id) {
        try {
            const response = await api.get(`/sessions/${id}/results`);
            return { success: true, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'No se pudieron cargar los resultados de la sesión';
            return { success: false, error: message };
        }
    },

    /**
     * Función que permite exportar los resultados de una sesión específica
     * @param {*} id - ID de la sesión
     * @returns Objeto con éxito si es exitoso, o error si falla
     */
    async exportResults(id) {
        try {
            const response = await api.get(`/sessions/${id}/results/export`, {
                responseType: 'blob',
            });

            const disposition = response.headers['content-disposition'] || '';
            const filenameMatch = disposition.match(/filename="?([^\"]+)"?/i);

            return {
                success: true,
                data: response.data,
                filename: filenameMatch?.[1] || `resultados-sesion-${id}.csv`,
            };
        } catch (error) {
            const message = error.response?.data?.message || 'No se pudieron exportar los resultados de la sesión';
            return { success: false, error: message };
        }
    },

    /**
     * Función que permite unirse a una sesión por medio del PIN
     * @param {*} pin - PIN de la sesión
     * @returns Objeto con éxito si es exitoso, o error si falla
     */
    async joinByPin(pin) {
        try {
            const response = await api.get(`/sessions/join/${pin}`);
            return { success: true, data: response.data.data, meta: response.data.meta ?? {} };
        } catch (error) {
            const errors = error.response?.data?.errors;
            const message = errors?.pin?.[0] || error.response?.data?.message || 'No se pudo unir a la sesión';
            return { success: false, error: message };
        }
    },

    /**
     * Función que permite crear una sesión
     * @param {*} payload - Datos de la sesión
     * @returns Objeto con éxito si es exitoso, o error si falla
     */
    async create(payload) {
        try {
            const response = await api.post('/sessions', payload);
            return { success: true, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'No se pudo crear la sesión';
            return { success: false, error: message, details: error.response?.data?.errors ?? null };
        }
    },

    /**
     * Función que permite avanzar a la siguiente fase de una sesión
     * @param {*} sessionId - ID de la sesión
     * @returns Objeto con éxito si es exitoso, o error si falla
     */
    async nextPhase(sessionId) {
        try {
            const response = await api.post(`/sessions/${sessionId}/next-phase`);
            return { success: true, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'No se pudo avanzar de fase';
            return { success: false, error: message, details: error.response?.data?.errors ?? null };
        }
    },

    /**
     * Función que permite enviar una respuesta en una sesión específica
     * @param {*} sessionId - ID de la sesión
     * @param {*} payload - Datos de la respuesta
     * @returns Objeto con éxito si es exitoso, o error si falla
     */
    async submitAnswer(sessionId, payload) {
        try {
            const response = await api.post(`/sessions/${sessionId}/answers`, {
                ...payload,
                pin: payload?.pin || readSessionPin(),
            });
            return { success: true, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'No se pudo enviar la respuesta';
            return { success: false, error: message, details: error.response?.data?.errors ?? null };
        }
    },

    /**
     * Función que permite actualizar la presencia de una sesión específica
     * @param {*} sessionId - ID de la sesión
     * @param {*} payload - Datos de la presencia
     * @returns Objeto con éxito si es exitoso, o error si falla
     */
    async touchPresence(sessionId, payload) {
        try {
            const response = await api.post(`/sessions/${sessionId}/presence`, payload);
            return { success: true, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'No se pudo actualizar la presencia de la sesión';
            return { success: false, error: message, details: error.response?.data?.errors ?? null };
        }
    },

    /**
     * Función que permite cerrar la presencia de una sesión específica
     * @param {*} sessionId - ID de la sesión
     * @param {*} payload - Datos de la presencia
     * @returns Objeto con éxito si es exitoso, o error si falla
     */
    async leavePresence(sessionId, payload) {
        try {
            const response = await api.post(`/sessions/${sessionId}/presence/leave`, payload);
            return { success: true, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'No se pudo cerrar la presencia de la sesión';
            return { success: false, error: message, details: error.response?.data?.errors ?? null };
        }
    },

    /**
     * Función que permite eliminar una sesión específica
     * @param {*} id - ID de la sesión
     * @returns Objeto con éxito si es exitoso, o error si falla
     */
    async delete(id) {
        try {
            const response = await api.delete(`/sessions/${id}`);
            return { success: true, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'No se pudo eliminar la sesión';
            return { success: false, error: message };
        }
    }
};

// FUNCIONES DE TIPOS DE JUEGO
export const gameTypeAPI = {

    /**
     * Función que permite listar los tipos de juego
     * @returns Objeto con éxito si es exitoso, o error si falla
     */
    async list() {
        try {
            const response = await api.get('/game-types');
            return { success: true, data: response.data.data ?? [] };
        } catch (error) {
            const message = error.response?.data?.message || 'No se pudieron cargar los tipos de juego';
            return { success: false, error: message };
        }
    }
};

// FUNCIONES DE JUEGOS
export const gameAPI = {
    /**
     * Función que permite listar los juegos disponibles
     * @returns Objeto con éxito si es exitoso, o error si falla
     */
    async list() {
        try {
            const response = await api.get('/games');
            return { success: true, data: response.data.data ?? [] };
        } catch (error) {
            const message = error.response?.data?.message || 'No se pudieron cargar los juegos';
            return { success: false, error: message };
        }
    },

    /**
     * Función que permite obtener un juego específico
     * @param {*} id - ID del juego
     * @returns Objeto con éxito si es exitoso, o error si falla
     */
    async get(id) {
        try {
            const response = await api.get(`/games/${id}`);
            return { success: true, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'No se pudo cargar el juego';
            return { success: false, error: message };
        }
    },

    /**
     * Función que permite crear un juego
     * @param {*} payload - Datos del juego
     * @returns Objeto con éxito si es exitoso, o error si falla
     */
    async create(payload) {
        try {
            const response = await api.post('/games', payload);
            return { success: true, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'No se pudo crear el juego';
            return { success: false, error: message, details: error.response?.data?.errors ?? null };
        }
    },

    /**
     * Función que permite actualizar un juego específico
     * @param {*} id - ID del juego
     * @param {*} payload - Datos del juego
     * @returns Objeto con éxito si es exitoso, o error si falla
     */
    async update(id, payload) {
        try {
            const response = await api.put(`/games/${id}`, payload);
            return { success: true, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'No se pudo actualizar el juego';
            return { success: false, error: message, details: error.response?.data?.errors ?? null };
        }
    },

    /**
     * Función que permite eliminar un juego específico
     * @param {*} id - ID del juego
     * @returns Objeto con éxito si es exitoso, o error si falla
     */
    async delete(id) {
        try {
            const response = await api.delete(`/games/${id}`);
            return { success: true, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'No se pudo eliminar el juego';
            return { success: false, error: message };
        }
    }
};

// FUNCIONES DE PLANES DE LECCIONES
export const lessonPlanAPI = {

    /**
     * Función que permite listar los planes de lecciones
     * @returns Objeto con éxito si es exitoso, o error si falla
     */
    async list() {
        try {
            const response = await api.get('/lesson-plans');
            return { success: true, data: response.data.data ?? [] };
        } catch (error) {
            const message = error.response?.data?.message || 'No se pudieron cargar los lesson plans';
            return { success: false, error: message };
        }
    },

    /**
     * Función que permite obtener un lesson plan específico
     * @param {*} id - ID del lesson plan
     * @returns Objeto con éxito si es exitoso, o error si falla
     */
    async get(id) {
        try {
            const response = await api.get(`/lesson-plans/${id}`);
            return { success: true, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'No se pudo cargar el lesson plan';
            return { success: false, error: message };
        }
    },

    /**
     * Función que permite crear un lesson plan
     * @param {*} payload - Datos del lesson plan
     * @returns Objeto con éxito si es exitoso, o error si falla
     */
    async create(payload) {
        try {
            const response = await api.post('/lesson-plans', payload);
            return { success: true, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'No se pudo crear el lesson plan';
            return { success: false, error: message, details: error.response?.data?.errors ?? null };
        }
    },

    /**
     * Función que permite actualizar un lesson plan específico
     * @param {*} id - ID del lesson plan
     * @param {*} payload - Datos del lesson plan
     * @returns Objeto con éxito si es exitoso, o error si falla
     */
    async update(id, payload) {
        try {
            const response = await api.put(`/lesson-plans/${id}`, payload);
            return { success: true, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'No se pudo actualizar el lesson plan';
            return { success: false, error: message, details: error.response?.data?.errors ?? null };
        }
    },
};

// FUNCIONES DE ADMINISTRACIÓN
export const adminAPI = {
    /**
     * Función que permite obtener el dashboard de admin
     * @returns Objeto con éxito si es exitoso, o error si falla
     */
    async dashboard() {
        try {
            const response = await api.get('/admin/dashboard');
            return { success: true, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'No se pudo cargar el dashboard de admin';
            return { success: false, error: message };
        }
    },

    /**
     * Función que permite obtener la gestión de usuarios
     * @returns Objeto con éxito si es exitoso, o error si falla
     */
    async users() {
        try {
            const response = await api.get('/admin/users');
            return { success: true, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'No se pudo cargar la gestión de usuarios';
            return { success: false, error: message };
        }
    },

    /**
     * Función que permite actualizar el rol de un usuario específico
     * @param {*} id - ID del usuario
     * @param {*} role - Rol del usuario
     * @returns Objeto con éxito si es exitoso, o error si falla
     */
    async updateUserRole(id, role) {
        try {
            const response = await api.patch(`/admin/users/${id}/role`, { role });
            return { success: true, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'No se pudo actualizar el rol';
            return { success: false, error: message };
        }
    },

    /**
     * Función que permite eliminar un usuario específico
     * @param {*} id - ID del usuario
     * @returns Objeto con éxito si es exitoso, o error si falla
     */
    async deleteUser(id) {
        try {
            const response = await api.delete(`/admin/users/${id}`);
            return { success: true, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'No se pudo eliminar el usuario';
            return { success: false, error: message };
        }
    },

    /**
     * Función que permite a un administrador crear un nuevo usuario
     * @param {*} payload - Datos del usuario (name, email, password, role)
     * @returns Objeto con éxito si es exitoso, o error si falla
     */
    async createUser(payload) {
        try {
            const response = await api.post('/admin/users', payload);
            return { success: true, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'No se pudo crear el usuario';
            return { success: false, error: message };
        }
    },

    /**
     * Función que permite obtener el catálogo de tipos de juego
     * @returns Objeto con éxito si es exitoso, o error si falla
     */
    async gameTypes() {
        try {
            const response = await api.get('/admin/game-types');
            return { success: true, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'No se pudo cargar el catálogo de tipos de juego';
            return { success: false, error: message };
        }
    },

    /**
     * Función que permite obtener el registro de auditoría
     * @returns Objeto con éxito si es exitoso, o error si falla
     */
    async audit() {
        try {
            const response = await api.get('/admin/audit');
            return { success: true, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'No se pudo cargar la actividad administrativa';
            return { success: false, error: message };
        }
    },
};

export default api;