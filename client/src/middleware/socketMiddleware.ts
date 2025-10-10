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

/**
 * Types des pièces renvoyées par le serveur
 * (DTO minimal pour la génération côté serveur)
 */
export type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';


/**
 * Données de spectrum envoyées par les autres joueurs
 */
export interface spectrum {
    socketId: string;
    name: string;
    spectrum: number[];
}

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

        // Demande un sac de pièces (7 pieces)
        requestPieceBag: (room: string) => {
            if (!socket) return
            socket.emit('requestPieceBag', room)
        },

        // Écoute la réception d'un sac de pièces (1 tableau de 7 pieces)
        onPieceBag: (callback: (bag: PieceType[]) => void) => {
            if (!socket) return
            socket.on('pieceBag', callback)
        },

        sendGarbageLines: (numberLines: number, room: string) => {
            if (!socket) return
            socket.emit('addGarbageLines', numberLines, room)
        },

        onGarbageLines: (callback: (numberLines: number) => void) => {
            if (!socket) return
            socket.on('garbageLines', callback)
        },

        sendPlayerLost: () => {
            if (!socket) return
            socket.emit('sendPlayerLost')
        },

        // Le serveur envoie le spectrum de tous les joueurs
        onSpectrum: (callback: (spectrum: spectrum[]) => void) => {
            if (!socket) return
            socket.on('spectrum', callback)
        },

        //Le joueur envoie sont spetrum a chaque qu'il pose une piece
        emitSpectrum: (spectrum: spectrum, socketId: string) => {
            if (!socket) return
            socket.emit('spectrum', spectrum, socketId)
        },

        // le joueur emet pour dire qu'il a perdu la game
        emitPlayerLost: (socketId: string) => {
            if (!socket) return
            socket.emit('playerLost', socketId)
        },

        // // Stoppe l'écoute du sac de pièces
        // offPieceBag: (callback: (bag: ServerPieceType[]) => void) => {
        //     if (!socket) return
        //     socket.off('pieceBag', callback)
        // },


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