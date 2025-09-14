import axios from "axios";
import axiosRetry from "axios-retry";
import { refreshTokens } from "./authRefresh";
import { BASE_API_URL } from "./constants";
import { LocalStorageAsync } from "./localstorage";

export const apiClient = axios.create({
    baseURL: BASE_API_URL,
    timeout: 120000,
    withCredentials: true,
});

axiosRetry(apiClient, { retries: 3 });

apiClient.interceptors.request.use(
    async (config) => {
        const token = await LocalStorageAsync.get("access");
        config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.data?.statusCode === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const newToken = await refreshTokens();
            if (newToken) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return apiClient(originalRequest); // retry with new token
            }
        }

        return Promise.reject(error);
    }
);
