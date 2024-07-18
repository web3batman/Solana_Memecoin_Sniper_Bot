import { ReactNode, createContext, useContext } from "react";
import { Socket, io } from "socket.io-client";

// Define the shape of the context
interface SocketContextProps {
    socket: Socket
}

// Create the User context
const SocketContext = createContext<SocketContextProps>({ socket: io() });

// Create the User context provider component
export const SocketProvider = ({ children }: { children: ReactNode }) => {
    const socket = io(`${import.meta.env.VITE_SERVER_URL}`);
    return (
        <SocketContext.Provider
            value={{
                socket,
            }}
        >
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);