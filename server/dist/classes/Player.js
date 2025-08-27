import { Socket } from 'socket.io';
class Player {
    id;
    name;
    socket;
    board;
    isAlive;
    constructor(id, name, socket) {
        this.id = id;
        this.name = name;
        this.socket = socket;
        this.board = this.initBoard();
        this.isAlive = true;
    }
    initBoard() {
        return Array.from({ length: 20 }, () => Array(10).fill(0));
    }
}
export default Player;
//# sourceMappingURL=Player.js.map