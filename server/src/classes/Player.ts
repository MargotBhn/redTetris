type Board = number[][];

class Player {
    name: string;
    socketId: string;
    board: Board;
    isAlive: boolean;
    isLeader: boolean;
    pieceIndex: number //index de la piece sur laquelle il est. A incrementer a chaque fois qu'il pose une piece

    constructor(name: string, socketId: string, isLeader: boolean) {
        this.name = name;
        this.socketId = socketId;
        this.board = this.initBoard();
        this.isAlive = true;
        this.isLeader = isLeader
        this.pieceIndex = 0;
    }

    private initBoard(): Board {
        return Array.from({length: 20}, () => Array(10).fill(0));
    }
}

export default Player;
