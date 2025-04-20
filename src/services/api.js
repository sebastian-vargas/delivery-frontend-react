import axios from 'axios';
import config from '../config';

// Crear una instancia de axios con la URL base
const api = axios.create({
    baseURL: config.API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para manejar tokens de autenticación
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

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Si el error es 401 (Unauthorized) y no hemos intentado refrescar el token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Intentar refrescar el token
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const response = await axios.post(
                        `${config.API_URL}${config.ENDPOINTS.AUTH.REFRESH_TOKEN}`,
                        { refreshToken }
                    );

                    if (response.data.token) {
                        localStorage.setItem('token', response.data.token);
                        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
                        return api(originalRequest);
                    }
                }
            } catch (refreshError) {
                // Si no se puede refrescar el token, redirigir al login
                console.error('Error refreshing token:', refreshError);
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                localStorage.removeItem('tokenExpiry');
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

// Servicio de autenticación
export const authService = {
    login: async (credentials) => {
        try {
            const response = await api.post(config.ENDPOINTS.AUTH.LOGIN, credentials);
            const result = response.data;
            if (result.data.token) {
                localStorage.setItem('token', result.data.token);
                localStorage.setItem('user', JSON.stringify(result.data.user));

                // Establecer tiempo de expiración
                const expiryTime = new Date().getTime() + config.TOKEN_EXPIRY;
                localStorage.setItem('tokenExpiry', expiryTime.toString());
            }
            return result;
        } catch (error) {
            throw error.response?.data || { message: 'Error en el servidor' };
        }
    },

    register: async (userData) => {
        const response = await api.post(config.ENDPOINTS.AUTH.REGISTER, userData);
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('tokenExpiry');
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        const tokenExpiry = localStorage.getItem('tokenExpiry');

        // Verificar si el token ha expirado
        if (tokenExpiry && new Date().getTime() > parseInt(tokenExpiry)) {
            authService.logout();
            return null;
        }

        return user ? JSON.parse(user) : null;
    },

    isAuthenticated: () => {
        const user = authService.getCurrentUser();
        return !!user;
    }
};

// Servicio para usuarios
export const userService = {
    /*getProfile: async () => {
        return api.get(config.ENDPOINTS.USERS.PROFILE);
    },*/

    /*updateProfile: async (userData) => {
        return api.put(config.ENDPOINTS.USERS.PROFILE, userData);
    },*/

    getAllUsers: async () => {
        return api.get(config.ENDPOINTS.USERS.ALL);
    }
};

// Servicio para pedidos
export const orderService = {
    getByGuia: async (guia) => {
        return api.get(config.ENDPOINTS.ORDERS.DETAIL(guia));
    },

    create: async (orderData) => {
        return api.post(config.ENDPOINTS.ORDERS.CREATE, orderData);
    },

    updateStatus: async (id, status) => {
        return api.patch(config.ENDPOINTS.ORDERS.DETAIL(id), { status });
    }
};

export const logisticsService = {
    create: async (orderData) => {
        return api.post(config.ENDPOINTS.LOGISTICS.CREATE, orderData);
    },
    getOrdenes: async () => {
        return api.get(config.ENDPOINTS.LOGISTICS.GET_ORDENES_PENDIENTES);
    },
    getRutas: async () => {
        return api.get(config.ENDPOINTS.LOGISTICS.GET_RUTAS);
    },
    getTransportistas: async () => {
        return api.get(config.ENDPOINTS.LOGISTICS.GET_TRANSPORTISTAS);
    }
};

// Servicio para productos
export const productService = {
    getAll: async () => {
        return api.get(config.ENDPOINTS.PRODUCTS.ALL);
    },

    getById: async (id) => {
        return api.get(config.ENDPOINTS.PRODUCTS.DETAIL(id));
    },

    create: async (productData) => {
        return api.post(config.ENDPOINTS.PRODUCTS.ALL, productData);
    },

    update: async (id, productData) => {
        return api.put(config.ENDPOINTS.PRODUCTS.DETAIL(id), productData);
    },

    delete: async (id) => {
        return api.delete(config.ENDPOINTS.PRODUCTS.DETAIL(id));
    }
};
export default api; 