// Configuración del backend
const config = {
    API_URL: 'http://localhost:3000/api/v1',

    // Rutas de la API
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/auth/login',
            REGISTER: '/auth/register',
            LOGOUT: '/auth/logout',
            REFRESH_TOKEN: '/auth/refresh-token'
        },
        USERS: {
            PROFILE: '/users/profile',
            ALL: '/users'
        },
        PRODUCTS: {
            ALL: '/products',
            DETAIL: (id) => `/products/${id}`
        },
        ORDERS: {
            //ALL: '/orders',
            DETAIL: (guia) => `/envios/guia/${guia}`,
            CREATE: '/envios'
        }
    },

    // Tiempo de vida del token en localStorage (en milisegundos)
    TOKEN_EXPIRY: 24 * 60 * 60 * 1000 // 24 horas
};

export default config; 