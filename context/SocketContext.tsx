import { BASE_SOCKET_URL } from "@/utils/constants";
import { LocalStorageAsync } from "@/utils/localstorage";
import { createContext, useContext, useEffect, useState } from "react";
import socketio from "socket.io-client";

interface SocketContextType {
    socket: ReturnType<typeof socketio> | null;
}

const getSocket = async () => {
    const token = LocalStorageAsync.get("token");

    return socketio(BASE_SOCKET_URL, {
        withCredentials: true,
        auth: { token },
    });
};

const SocketContext = createContext<SocketContextType>({ socket: null });

const useSocket = () => useContext(SocketContext);

const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<ReturnType<typeof socketio> | null>(null);

    useEffect(() => {
        (async () => {
            const sc = await getSocket();
            setSocket(sc);
        })();
    }, []);

    return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};

export { SocketContext, useSocket };
