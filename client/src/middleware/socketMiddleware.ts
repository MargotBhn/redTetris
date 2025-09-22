/**
 * Socket.io Middleware - Complete Encapsulation
 *
 * This middleware acts as an intermediary layer between React components and socket.io,
 * providing complete encapsulation by:
 * - Being the ONLY place where socket.io is directly imported and instantiated
 * - Providing a clean, consistent API (connect, emit, on, off, disconnect)
 * - Abstracting all socket.io complexity from components
 * - Centralizing connection management and error handling
 * - Following the Facade design pattern to hide implementation details
 *
 * Components never import socket.io-client directly - they only use this middleware,
 * ensuring complete separation of concerns and easier maintenance.
 */
import {io, Socket} from "socket.io-client";


const createMiddleware = () => {
    let socket: Socket | null = null

    return {
        connect: () => {
            if (socket) {
                socket.disconnect()
            }
            socket = io("http://localhost:3000")
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

        emit: (message: string, ...args: any[]) => {
            if (!socket) return
            socket.emit(message, ...args)
        },

        disconnect: () => {
            if (socket) {
                socket.removeAllListeners();
                socket.disconnect()
                socket = null
            }
        },

        isConnected: () => {
            return socket?.connected || false
        },

        getId: () => {
            return socket?.id
        }
    }
}

// Export an instance of the function
export const socketMiddleware = createMiddleware()