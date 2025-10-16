import Player from './Player.js';

class Game {
    roomName: string;
    players: Player[];
    pieceQueue: string[][];
    started: boolean
    isMultiplayer: boolean;

    // 7-bag internals
    private pieceBag: string[];
    private static PIECE_TYPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

    constructor(roomName: string) {
        this.roomName = roomName;
        this.players = [];
        this.pieceQueue = [];
        this.started = false;
        this.isMultiplayer = false;


        this.pieceBag = [];
        this.pushNewBagToQueue();
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

    // Push one shuffled bag of 7 types into the shared queue
    pushNewBagToQueue() {
        if (this.pieceBag.length === 0) {
            this.refillBag();
        }
        const newBag: string[] = []
        while (this.pieceBag.length > 0) {
            const type = this.pieceBag.pop()!
            newBag.push(type)
        }
        this.pieceQueue.push(newBag);
    }

    getPieceBag(index: number) {
        if (index == this.pieceQueue.length - 1) {
            this.pushNewBagToQueue()
        }
        return this.pieceQueue[index];
    }

    getAllSpectrums() {
        return this.players.map((player => {
            return {
                socketId: player.socketId,
                username: player.name,
                spectrum: player.spectrum,
                isAlive: player.isAlive,
            }
        }))
    }

}

export default Game;