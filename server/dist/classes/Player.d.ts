import { Socket } from 'socket.io';
type Board = number[][];
declare class Player {
    id: string;
    name: string;
    socket: Socket;
    board: Board;
    isAlive: boolean;
    constructor(id: string, name: string, socket: Socket);
    private initBoard;
}
export default Player;
//# sourceMappingURL=Player.d.ts.map