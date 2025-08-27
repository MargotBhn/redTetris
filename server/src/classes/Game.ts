import Player from './Player.js';
import Piece from './Piece.js';

class Game {
    roomName: string;
    players: Player[];
    pieceQueue: Piece[];
    // hostId: string | null;
    started: boolean

    constructor(roomName: string) {
        this.roomName = roomName;
        this.players = [];
        this.pieceQueue = [];
        this.started = false;
        // this.hostId = null;
    }

    // addPlayer(player: Player) {
    //   this.players.push(player);
    //   if (!this.hostId) {
    //     this.hostId = player.id;
    //   }
    // }
    //
    // removePlayer(playerId: string) {
    //   this.players = this.players.filter(p => p.id !== playerId);
    //   if (playerId === this.hostId && this.players.length > 0) {
    //     this.hostId = this.players[0].id;
    //   }
    // }
    //
    // generateNextPiece(): Piece {
    //   const piece = new Piece();
    //   this.pieceQueue.push(piece);
    //   return piece;
    // }
    //
    // getNextPiece(): Piece {
    //   if (this.pieceQueue.length === 0) {
    //       this.generateNextPiece();
    //   }
    //   return this.pieceQueue.shift()!;
    // }
}

export default Game;