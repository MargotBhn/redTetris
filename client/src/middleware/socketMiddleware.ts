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
import {spec} from "node:test/reporters";

/**
 * Types des pièces renvoyées par le serveur
 * (DTO minimal pour la génération côté serveur)
 */
export type ServerPieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';


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

        /**
         * Endpoints de génération des pièces
         * Alignés avec les événements serveur :
         * - 'pieces' (requête + réponse sur le même événement)
         * - 'pieces:queue' (peek non-destructif, groupé par sacs de 7)
         */

        // // Demande au serveur N types de pièces (par défaut 7) pour une room
        // requestPieces: (room: string, count: number = 7) => {
        //     if (!socket) return
        //     socket.emit('pieces', room, count)
        // },
        //
        // // Écoute la réponse 'pieces' contenant un tableau de types
        // onPieces: (callback: (types: ServerPieceType[]) => void) => {
        //     if (!socket) return
        //     socket.on('pieces', callback)
        // },
        //
        // // Arrête d'écouter la réponse 'pieces'
        // offPieces: (callback: (types: ServerPieceType[]) => void) => {
        //     if (!socket) return
        //     socket.off('pieces', callback)
        // },


        /**
         * Endpoints dédiés à la génération des pièces
         */

        // // Demande la prochaine pièce pour une room
        // requestNextPiece: (room: string) => {
        //     if (!socket) return
        //     socket.emit('requestNextPiece', room)
        // },
        //
        // // Écoute la prochaine pièce fournie par le serveur
        // onNextPiece: (callback: (piece: ServerPiece) => void) => {
        //     if (!socket) return
        //     socket.on('nextPiece', callback)
        // },
        //
        // // Stoppe l'écoute de la prochaine pièce
        // offNextPiece: (callback: (piece: ServerPiece) => void) => {
        //     if (!socket) return
        //     socket.off('nextPiece', callback)
        // },

        // Demande un sac de pièces (7 pieces)
        requestPieceBag: (room: string) => {
            if (!socket) return
            socket.emit('requestPieceBag', room)
        },

        // Écoute la réception d'un sac de pièces (1 tableau de 7 pieces)
        onPieceBag: (callback: (bag: ServerPieceType[]) => void) => {
            if (!socket) return
            socket.on('pieceBag', callback)
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