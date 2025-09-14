import { refreshTokens } from "@/utils/authRefresh"; // ✅ shared
import { BASE_SOCKET_URL, ChatEventEnum } from "@/utils/constants";
import { LocalStorageAsync } from "@/utils/localstorage";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import socketio from "socket.io-client";
import { useAuth } from "./AuthContext";

interface SocketContextType {
    socket: ReturnType<typeof socketio> | null;
}

const getSocket = async (token?: string) => {
    const accessToken = token || (await LocalStorageAsync.get("access"));
    return socketio(BASE_SOCKET_URL, {
        withCredentials: true,
        auth: { token: accessToken },
    });
};

const SocketContext = createContext<SocketContextType>({ socket: null });

const useSocket = () => useContext(SocketContext);

const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<ReturnType<typeof socketio> | null>(null);
    const socketRef = useRef<ReturnType<typeof socketio> | null>(null);

    const { token } = useAuth();

    useEffect(() => {
        let isMounted = true;

        const initSocket = async (tokenOverride?: string) => {
            try {
                if (socketRef.current?.connected) return;

                const sc = await getSocket(tokenOverride);

                if (isMounted) {
                    socketRef.current = sc;
                    setSocket(sc);
                }

                sc.on("connect", () => {
                    console.log("Socket connected:", sc.id);
                });

                sc.on("disconnect", (reason) => {
                    console.log("Socket disconnected:", reason);
                });

                sc.on(ChatEventEnum.SOCEKT_CONNECT_ERROR, async (error: any) => {
                    console.log("Socket connection error:", error);

                    if (typeof error === "string" && error.includes("jwt expired")) {
                        console.log("JWT expired, refreshing tokens...");
                        const newToken = await refreshTokens();

                        if (newToken) {
                            console.log("Reconnecting socket with new token...");
                            sc.removeAllListeners();
                            sc.disconnect();
                            initSocket(newToken);
                        }
                    }
                });
            } catch (error) {
                console.log("Failed to initialize socket:", error);
            }
        };

        initSocket();

        return () => {
            isMounted = false;
            if (socketRef.current) {
                console.log("Cleaning up socket connection");
                socketRef.current.removeAllListeners();
                socketRef.current.disconnect();
                socketRef.current = null;
                setSocket(null);
            }
        };
    }, [token]);

    return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};

export { SocketProvider, useSocket };
