import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// Create Axios instance with base URL
const api: AxiosInstance = axios.create({
    baseURL: 'https://2p886xzx-5000.inc1.devtunnels.ms/api/v1/',
    timeout: 10000, // 10 seconds timeout
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config: any) => {
        // You can modify the request config here (e.g., add auth tokens)
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response: AxiosResponse) => {
        // You can modify the response data here
        return response;
    },
    (error: AxiosError) => {
        // Handle errors here
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Response error:', error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('Request error:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error:', error.message);
        }
        return Promise.reject(error);
    }
);

// API functions
export const apiService = {
    get: async <T>(url: string, params?: object, headers?: object): Promise<T> => {
        try {
            const response: AxiosResponse<T> = await api.get(url, { params, headers });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    post: async <T>(url: string, data: object, headers?: object): Promise<T> => {
        try {
            const response: AxiosResponse<T> = await api.post(url, data, { headers });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    put: async <T>(url: string, data: object): Promise<T> => {
        try {
            const response: AxiosResponse<T> = await api.put(url, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // You can add more methods like delete, patch, etc. as needed
};

export default api;
