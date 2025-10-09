type Board = number[][];

class Player {
    name: string;
    socketId: string;
    board: Board;
    isAlive: boolean;
    isLeader: boolean;
    bagIndex: number //index de la piece sur laquelle il est. A incrementer a chaque fois qu'il pose une piece
    spectrum: number[]; // hauteur maximale par colonne (10 colonnes)

    constructor(name: string, socketId: string, isLeader: boolean) {
        this.name = name;
        this.socketId = socketId;
        this.board = this.initBoard();
        this.isAlive = true;
        this.isLeader = isLeader
        this.bagIndex = 0;
        this.spectrum = Array(10).fill(0);
    }

    private initBoard(): Board {
        return Array.from({length: 20}, () => Array(10).fill(0));
    }

    getBagIndex() {
        return this.bagIndex;
    }

    incrementBagIndex() {
        this.bagIndex += 1;
    }
}

export default Player;
