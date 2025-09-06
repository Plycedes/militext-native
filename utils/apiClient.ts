import axios from "axios";
import axiosRetry from "axios-retry";
import { router } from "expo-router";
import { BASE_API_URL } from "./constants";
import { LocalStorageAsync } from "./localstorage";

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const performLogout = async () => {
    await LocalStorageAsync.clear();
    router.replace("/sign-in");
};

const subscribeTokenRefresh = (cb: (token: string) => void) => {
    refreshSubscribers.push(cb);
};

const onRefreshed = (newAccessToken: string) => {
    refreshSubscribers.forEach((cb) => cb(newAccessToken));
    refreshSubscribers = [];
};

export const apiClient = axios.create({
    baseURL: BASE_API_URL,
    timeout: 120000,
    withCredentials: true,
});

axiosRetry(apiClient, { retries: 3 });

apiClient.interceptors.request.use(
    async function (config) {
        const token = await LocalStorageAsync.get("access");
        config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.data?.statusCode === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (!isRefreshing) {
                isRefreshing = true;
                try {
                    const refreshToken = await LocalStorageAsync.get("refresh");
                    console.log("Trying to refresh", refreshToken);
                    const response = await axios.post(BASE_API_URL + "/users/refresh-token", {
                        refreshToken: refreshToken,
                    });
                    console.log("Refreshed Tokens-- \n", response.data);

                    const { accessToken, refreshToken: newRefreshToken } = response.data.data;
                    await LocalStorageAsync.set("access", accessToken);
                    await LocalStorageAsync.set("refresh", newRefreshToken);

                    onRefreshed(accessToken);
                    isRefreshing = false;

                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return apiClient(originalRequest); // Retry
                } catch (refreshError: any) {
                    console.log("Refresh token failed:", refreshError);
                    isRefreshing = false;

                    if (refreshError.response?.data?.statusCode === 401) {
                        console.log("Refresh token is also invalid, logging out user");
                        await performLogout();
                    } else {
                        await performLogout();
                    }

                    return Promise.reject(refreshError);
                }
            }

            return new Promise((resolve) => {
                subscribeTokenRefresh((newToken) => {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    resolve(apiClient(originalRequest));
                });
            });
        }

        return Promise.reject(error);
    }
);
