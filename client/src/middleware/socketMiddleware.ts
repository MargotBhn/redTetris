import {io, Socket} from "socket.io-client";


const createMiddleware = () => {
    let socket: Socket | null = null

    return {
        connect: () => {
            if (socket) {
                console.log("socket a deconnecter ", socket.id)
                socket.disconnect()
            }
            socket = io("http://localhost:3000")

            socket.on('connect', () => {
                console.log("socket connected with id:", socket?.id)
            })
            console.log("socket created ", socket)
        },

        on: (event: string, callback: any) => {
            if (!socket) {
                return
            }
            socket.on(event, callback)
        },

        // Free une ecoute
        off: (event: string, callback: any) => {
            if (socket) {
                socket.off(event, callback);
            }
        },

        emit: (message: string, data: any) => {
            if (!socket) return
            socket.emit(message, data)
        },

        disconnect: () => {
            if (socket) {
                socket.removeAllListeners();
                socket.disconnect()
                socket = null
            }
        },
        getSocket: () => {
            if (socket) {
                console.log('Print socket ', socket)
                return socket.id
            } else
                return "Socket null"
        },

        isConnected: () => {
            if (socket && socket.connect()) {
                return true
            }
        }
    }
}

// Export an instance of the function
export const socketMiddleware = createMiddleware()