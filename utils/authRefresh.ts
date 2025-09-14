// utils/authRefresh.ts
import axios from "axios";
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

export const refreshTokens = async (): Promise<string | null> => {
    if (isRefreshing) {
        return new Promise((resolve) => {
            subscribeTokenRefresh((newToken) => resolve(newToken));
        });
    }

    isRefreshing = true;
    try {
        const refreshToken = await LocalStorageAsync.get("refresh");
        if (!refreshToken) {
            await performLogout();
            return null;
        }

        const response = await axios.post(`${BASE_API_URL}/users/refresh-token`, {
            refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        await LocalStorageAsync.set("access", accessToken);
        await LocalStorageAsync.set("refresh", newRefreshToken);

        onRefreshed(accessToken);
        isRefreshing = false;
        return accessToken;
    } catch (err) {
        console.error("Refresh token failed:", err);
        isRefreshing = false;
        await performLogout();
        return null;
    }
};
