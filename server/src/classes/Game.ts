import Player from './Player.js';
import Piece from './Piece.js';
import type { PieceType } from './Piece.js';

class Game {
    roomName: string;
    players: Player[];
    pieceQueue: Piece[];
    // hostId: string | null;
    started: boolean

    // New: 7-bag internals
    private pieceBag: string[];
    private static PIECE_TYPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

    constructor(roomName: string) {
        this.roomName = roomName;
        this.players = [];
        this.pieceQueue = [];
        this.started = false;
        // this.hostId = null;

        // initialize bag
        this.pieceBag = [];
    }

    // Fisher-Yates shuffle for the bag
    private shuffleBag() {
        for (let i = this.pieceBag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const tmp = this.pieceBag[i]!;
            this.pieceBag[i] = this.pieceBag[j]!;
            this.pieceBag[j] = tmp;
        }
    }

    // Refill the bag with the 7 piece types and shuffle
    private refillBag() {
        this.pieceBag = [...Game.PIECE_TYPES];
        this.shuffleBag();
    }

    // Generate a single next piece from the 7-bag and push it into pieceQueue
    generateNextPiece(): Piece {
        if (this.pieceBag.length === 0) {
            this.refillBag();
        }
        const type = this.pieceBag.pop()!;
        const piece = new Piece(type as PieceType);
        this.pieceQueue.push(piece);
        return piece;
    }

    // Ensure pieceQueue has at least `count` pieces (generate as needed)
    generatePieces(count: number) {
        while (this.pieceQueue.length < count) {
            this.generateNextPiece();
        }
    }

    // Get next piece from queue, generate if empty
    getNextPiece(): Piece {
        if (this.pieceQueue.length === 0) {
            this.generateNextPiece();
        }
        return this.pieceQueue.shift()!;
    }
}

export default Game;