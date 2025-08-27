type Board = number[][];

class Player {
    name: string;
    socketId: string;
    board: Board;
    isAlive: boolean;
    isLeader: boolean;

    constructor(name: string, socketId: string, isLeader: boolean) {
        this.name = name;
        this.socketId = socketId;
        this.board = this.initBoard();
        this.isAlive = true;
        this.isLeader = isLeader
    }

    private initBoard(): Board {
        return Array.from({length: 20}, () => Array(10).fill(0));
    }
}

export default Player;
