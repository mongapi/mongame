import axios from 'axios';

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

// 5. EXPORTAR API CONFIGURADA PARA OTRAS PETICIONES
export default api;