import { BASE_SOCKET_URL } from "@/utils/constants";
import { LocalStorageAsync } from "@/utils/localstorage";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import socketio from "socket.io-client";

interface SocketContextType {
    socket: ReturnType<typeof socketio> | null;
}

const getSocket = async () => {
    const token = await LocalStorageAsync.get("access");

    return socketio(BASE_SOCKET_URL, {
        withCredentials: true,
        auth: { token },
    });
};

const SocketContext = createContext<SocketContextType>({ socket: null });

const useSocket = () => useContext(SocketContext);

const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<ReturnType<typeof socketio> | null>(null);
    const socketRef = useRef<ReturnType<typeof socketio> | null>(null);

    useEffect(() => {
        let isMounted = true; // Prevent state updates if component unmounts

        const initSocket = async () => {
            try {
                // If socket already exists, don't create a new one
                if (socketRef.current?.connected) {
                    return;
                }

                const sc = await getSocket();

                // Check if component is still mounted before setting state
                if (isMounted) {
                    socketRef.current = sc;
                    setSocket(sc);
                }

                // Handle connection events for debugging
                sc.on("connect", () => {
                    console.log("Socket connected:", sc.id);
                });

                sc.on("disconnect", (reason) => {
                    console.log("Socket disconnected:", reason);
                });

                sc.on("connect_error", (error) => {
                    console.error("Socket connection error:", error);
                });
            } catch (error) {
                console.error("Failed to initialize socket:", error);
            }
        };

        initSocket();

        // Cleanup function
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
    }, []);

    return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};

export { SocketProvider, useSocket };
