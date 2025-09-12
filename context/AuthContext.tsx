import { AuthContextType, UserInterface } from "@/types/misc";
import { getCurrentUser, loginUser, logoutUser, registerUser } from "@/utils/apiMethods";
import { LocalStorageAsync } from "@/utils/localstorage";
import { router } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    login: async () => {},
    register: async () => {},
    logout: async () => {},
    current: async () => {},
});

const useAuth = () => useContext(AuthContext);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState<UserInterface | null>(null);
    const [token, setToken] = useState<string | null>(null);

    const login = async (data: { username: string; password: string }) => {
        try {
            const response = await loginUser(data);
            const res = response.data;
            setUser(res.data.user);
            setToken(res.data.accessToken);
            await LocalStorageAsync.set("user", JSON.stringify(res.data.user));
            await LocalStorageAsync.set("access", res.data.accessToken);
            await LocalStorageAsync.set("refresh", res.data.accessToken);
            router.replace("/");
        } catch (error: any) {
            console.log("Error occured", error);
        }
    };

    const register = async (data: {
        username: string;
        email: string;
        number: string;
        password: string;
    }) => {
        try {
            await registerUser(data);
            router.replace("/sign-in");
        } catch (error: any) {
            console.log("Error occured", error);
        }
    };

    const current = async () => {
        try {
            const response = await getCurrentUser();
            console.log("Data from here", response.data.data);
            setUser(response.data.data);
            await LocalStorageAsync.set("user", JSON.stringify(response.data.data));
        } catch (error) {
            console.log("Error occured", error);
        }
    };

    const logout = async () => {
        try {
            await logoutUser();
            router.replace("/sign-in");
        } catch (error: any) {
            console.log("Error occured", error);
        }
    };

    useEffect(() => {
        setIsLoading(true);
        (async () => {
            const _token = await LocalStorageAsync.get("access");
            const _user = await LocalStorageAsync.get("user");
            console.log(_token);
            if (_token && _user?._id) {
                setUser(_user);
                setToken(_token);
            } else {
                router.replace("/sign-in");
            }
        })();
        setIsLoading(false);
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, register, logout, current, token }}>
            {isLoading ? <div>Loading...</div> : children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider, useAuth };
