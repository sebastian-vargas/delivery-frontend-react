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
        LOGISTICS: {
            CREATE: '/logistica/asignar',
            GET_RUTAS: '/logistica/rutas?page=1&limit=100',
            GET_TRANSPORTISTAS: '/logistica/transportistas?page=1&limit=100',
            GET_ORDENES_PENDIENTES: `envios/estado/en_espera?page=1&limit=100`
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