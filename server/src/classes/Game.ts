import Player from './Player.js';

class Game {
    roomName: string;
    players: Player[];
    // Shared queue of upcoming piece types (strings), generated in 7-bag chunks
    pieceQueue: string[];
    // hostId: string | null;
    started: boolean

    // 7-bag internals
    private pieceBag: string[];
    private static PIECE_TYPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

    constructor(roomName: string) {
        console.log(`[Game] Creating game for room: ${roomName}`);
        this.roomName = roomName;
        this.players = [];
        this.pieceQueue = [];
        this.started = false;
        // this.hostId = null;

        // initialize bag
        this.pieceBag = [];
        // console.log('[Game] Initialized empty pieceBag:', this.pieceBag);

        // Pre-fill the queue with exactly two shuffled bags (14 pieces)
        // console.log('[Game] Generating first 7-piece bag...');
        this.pushNewBagToQueue();
        // console.log('[Game] pieceQueue after first bag:', [...this.pieceQueue]);

        // console.log('[Game] Generating second 7-piece bag...');
        this.pushNewBagToQueue();
        // console.log('[Game] pieceQueue after second bag:', [...this.pieceQueue], 'length=', this.pieceQueue.length);
    }

    // Fisher-Yates shuffle for the bag
    private shuffleBag() {
        // console.log('[Game] Shuffling bag (before):', [...this.pieceBag]);
        for (let i = this.pieceBag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const tmp = this.pieceBag[i]!;
            this.pieceBag[i] = this.pieceBag[j]!;
            this.pieceBag[j] = tmp;
        }
        // console.log('[Game] Shuffling bag (after):', [...this.pieceBag]);
    }

    // Refill the bag with the 7 piece types and shuffle
    private refillBag() {
        this.pieceBag = [...Game.PIECE_TYPES];
        // console.log('[Game] Refilled bag with PIECE_TYPES:', [...this.pieceBag]);
        this.shuffleBag();
    }

    // Push one shuffled bag of 7 types into the shared queue
    private pushNewBagToQueue() {
        // console.log('[Game] pushNewBagToQueue() called. Current pieceBag length:', this.pieceBag.length);
        if (this.pieceBag.length === 0) {
            this.refillBag();
        }
        const initialQueueLen = this.pieceQueue.length;
        const pushed: string[] = [];
        while (this.pieceBag.length > 0) {
            const type = this.pieceBag.pop()!; // pop after shuffle => random order
            pushed.push(type);
            this.pieceQueue.push(type);
        }
        // console.log('[Game] Pushed bag to queue:', pushed, 'Queue length delta:', this.pieceQueue.length - initialQueueLen, 'New queue length:', this.pieceQueue.length);
    }

    // Ensure the shared queue has at least `n` items available
    ensureTypes(n: number) {
        while (this.pieceQueue.length < n) {
            this.pushNewBagToQueue();
        }
    }

    // Dequeue `n` types to send to a client; auto-refill when nearing the end of a bag
    takeTypes(n: number): string[] {
        this.ensureTypes(n);
        const out: string[] = [];
        for (let i = 0; i < n; i++) {
            const t = this.pieceQueue.shift();
            if (t) out.push(t);
        }
        // If the queue is running low, append a fresh bag to keep latency low
        if (this.pieceQueue.length < 7) {
            this.pushNewBagToQueue();
        }
        return out;
    }

    // Peek next `n` types without consuming
    peekTypes(n: number): string[] {
        this.ensureTypes(n);
        return this.pieceQueue.slice(0, n);
    }
}

export default Game;