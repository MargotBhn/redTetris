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

    getPlayer(socketId: string) {
        for (const player of this.players) {
            if (player.socketId === socketId) {
                return player;
            }
        }
        return null;
    }

    checkMultiplayer() {
        this.isMultiplayer = this.players.length >= 1;
    }

    countAlivePlayers() {
        let count = 0
        let lastSocketId = ""
        for (const player of this.players) {
            if (player.isAlive) {
                count += 1;
                lastSocketId = player.socketId
            }
        }
        return {count, lastSocketId}
    }

    resetGame() {
        this.pieceQueue = []
        this.pushNewBagToQueue()
        for (const player of this.players) {
            player.isAlive = true;
            player.spectrum = Array(10).fill(0)
            player.bagIndex = 0
        }
        this.started = false
    }

    // Returns if end of game and winner socket id if multiplayer
    isEndOfGame(): { endOfGame: boolean, winner: string | null } {
        const {count, lastSocketId} = this.countAlivePlayers();

        // if multiplayer, game ends when one player remains
        if (count === 1 && this.isMultiplayer)
            return {endOfGame: true, winner: lastSocketId}

        // if solo player, game end when he looses
        if (count === 0)
            return {endOfGame: true, winner: null}

        return {endOfGame: false, winner: null}
    }


}

export default Game;