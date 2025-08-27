import {Socket} from 'socket.io';

type Board = number[][];

class Player {
    name: string;
    socketId: Socket;
    board: Board;
    isAlive: boolean;

    constructor(name: string, socket: Socket) {
        this.name = name;
        this.socketId = socket;
        this.board = this.initBoard();
        this.isAlive = true;
    }

    private initBoard(): Board {
        return Array.from({length: 20}, () => Array(10).fill(0));
    }
}

export default Player;
