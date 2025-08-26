import { Socket } from 'socket.io';

type Board = number[][];

class Player {
    id: string;
    name: string;
    socket: Socket;
    board: Board;
    isAlive: boolean;

    constructor(id: string, name: string, socket: Socket) {
        this.id = id;
        this.name = name;
        this.socket = socket;
        this.board = this.initBoard();
        this.isAlive = true;
    }

    private initBoard(): Board {
        return Array.from({ length: 20 }, () => Array(10).fill(0));
    }
}

export default Player;
