import axios from 'axios';

function readSessionPin() {
    if (typeof window === 'undefined') {
        return '';
    }

    return new URLSearchParams(window.location.search).get('pin') || '';
}

// 1. CONFIGURACIÓN BASE DE AXIOS
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// 2. INTERCEPTOR PARA AGREGAR TOKEN AUTOMÁTICAMENTE
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

// 3. INTERCEPTOR PARA MANEJAR RESPUESTAS Y ERRORES
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

// 4. FUNCIONES DE AUTENTICACIÓN
export const authAPI = {
    // LOGIN: Envía email y password, recibe token
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

    // REGISTER: Envía datos de usuario, recibe token 
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

    // LOGOUT: Elimina token del servidor y localStorage
    async logout() {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.log('Error al cerrar sesión:', error);
        } finally {
            // Siempre limpiar localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    },

    // Verificar si el usuario está autenticado
    isAuthenticated() {
        return !!localStorage.getItem('token');
    },

    // Obtener usuario actual
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }
};

export const sessionAPI = {
    async list() {
        try {
            const response = await api.get('/sessions');
            return { success: true, data: response.data.data ?? [] };
        } catch (error) {
            const message = error.response?.data?.message || 'No se pudieron cargar las sesiones';
            return { success: false, error: message };
        }
    },

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

    async results(id) {
        try {
            const response = await api.get(`/sessions/${id}/results`);
            return { success: true, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'No se pudieron cargar los resultados de la sesión';
            return { success: false, error: message };
        }
    },

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

    async create(payload) {
        try {
            const response = await api.post('/sessions', payload);
            return { success: true, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'No se pudo crear la sesión';
            return { success: false, error: message, details: error.response?.data?.errors ?? null };
        }
    },

    async nextPhase(sessionId) {
        try {
            const response = await api.post(`/sessions/${sessionId}/next-phase`);
            return { success: true, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'No se pudo avanzar de fase';
            return { success: false, error: message, details: error.response?.data?.errors ?? null };
        }
    },

    async submitAnswer(sessionId, payload) {
        try {
            const response = await api.post(`/sessions/${sessionId}/answers`, {
                pin: payload?.pin || readSessionPin(),
                ...payload,
            });
            return { success: true, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'No se pudo enviar la respuesta';
            return { success: false, error: message, details: error.response?.data?.errors ?? null };
        }
    },

    async touchPresence(sessionId, payload) {
        try {
            const response = await api.post(`/sessions/${sessionId}/presence`, payload);
            return { success: true, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'No se pudo actualizar la presencia de la sesión';
            return { success: false, error: message, details: error.response?.data?.errors ?? null };
        }
    },

    async leavePresence(sessionId, payload) {
        try {
            const response = await api.post(`/sessions/${sessionId}/presence/leave`, payload);
            return { success: true, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'No se pudo cerrar la presencia de la sesión';
            return { success: false, error: message, details: error.response?.data?.errors ?? null };
        }
    }
};

export const gameTypeAPI = {
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

export const gameAPI = {
    async list() {
        try {
            const response = await api.get('/games');
            return { success: true, data: response.data.data ?? [] };
        } catch (error) {
            const message = error.response?.data?.message || 'No se pudieron cargar los juegos';
            return { success: false, error: message };
        }
    },

    async get(id) {
        try {
            const response = await api.get(`/games/${id}`);
            return { success: true, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'No se pudo cargar el juego';
            return { success: false, error: message };
        }
    },

    async create(payload) {
        try {
            const response = await api.post('/games', payload);
            return { success: true, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'No se pudo crear el juego';
            return { success: false, error: message, details: error.response?.data?.errors ?? null };
        }
    },

    async update(id, payload) {
        try {
            const response = await api.put(`/games/${id}`, payload);
            return { success: true, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'No se pudo actualizar el juego';
            return { success: false, error: message, details: error.response?.data?.errors ?? null };
        }
    }
};

export const lessonPlanAPI = {
    async list() {
        try {
            const response = await api.get('/lesson-plans');
            return { success: true, data: response.data.data ?? [] };
        } catch (error) {
            const message = error.response?.data?.message || 'No se pudieron cargar los lesson plans';
            return { success: false, error: message };
        }
    },

    async get(id) {
        try {
            const response = await api.get(`/lesson-plans/${id}`);
            return { success: true, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'No se pudo cargar el lesson plan';
            return { success: false, error: message };
        }
    },

    async create(payload) {
        try {
            const response = await api.post('/lesson-plans', payload);
            return { success: true, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'No se pudo crear el lesson plan';
            return { success: false, error: message, details: error.response?.data?.errors ?? null };
        }
    },

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

export const adminAPI = {
    async dashboard() {
        try {
            const response = await api.get('/admin/dashboard');
            return { success: true, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'No se pudo cargar el dashboard de admin';
            return { success: false, error: message };
        }
    },
};

// 5. EXPORTAR API CONFIGURADA PARA OTRAS PETICIONES
export default api;