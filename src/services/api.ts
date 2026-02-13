import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL, ERROR_MESSAGES } from '../constants';
import { tokenUtils } from '../utils';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = tokenUtils.get();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error) => {
        if (error.response) {
            const { status } = error.response;

            switch (status) {
                case 401:
                    // Unauthorized - Clear token and redirect to login
                    tokenUtils.remove();
                    window.location.href = '/login';
                    return Promise.reject({ message: ERROR_MESSAGES.UNAUTHORIZED });

                case 403:
                    return Promise.reject({ message: ERROR_MESSAGES.FORBIDDEN });

                case 404:
                    return Promise.reject({ message: ERROR_MESSAGES.NOT_FOUND });

                case 500:
                case 502:
                case 503:
                    return Promise.reject({ message: ERROR_MESSAGES.SERVER_ERROR });

                default:
                    return Promise.reject(error.response.data);
            }
        } else if (error.request) {
            // Network error
            return Promise.reject({ message: ERROR_MESSAGES.NETWORK_ERROR });
        } else {
            return Promise.reject({ message: error.message || ERROR_MESSAGES.SERVER_ERROR });
        }
    }
);

// Generic API methods
const api = {
    get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
        const response = await apiClient.get<T>(url, config);
        return response.data;
    },

    post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
        const response = await apiClient.post<T>(url, data, config);
        return response.data;
    },

    put: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
        const response = await apiClient.put<T>(url, data, config);
        return response.data;
    },

    patch: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
        const response = await apiClient.patch<T>(url, data, config);
        return response.data;
    },

    delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
        const response = await apiClient.delete<T>(url, config);
        return response.data;
    },

    upload: async <T = any>(url: string, formData: FormData, onProgress?: (progress: number) => void): Promise<T> => {
        const config: AxiosRequestConfig = {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(progress);
                }
            },
        };
        const response = await apiClient.post<T>(url, formData, config);
        return response.data;
    },
};

export default api;
export { apiClient };
