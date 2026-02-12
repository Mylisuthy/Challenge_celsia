import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor
apiClient.interceptors.request.use(
    (config) => {
        const customer = JSON.parse(localStorage.getItem('customer') || '{}');
        if (customer.Token) {
            config.headers.Authorization = `Bearer ${customer.Token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle 401
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('customer');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default apiClient;
