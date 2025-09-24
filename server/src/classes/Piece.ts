export type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

class Piece {
    types: Record<string, PieceType>;
    type: PieceType;

    constructor(type?: PieceType) {
        this.types = {
            I: 'I',
            O: 'O',
            T: 'T',
            S: 'S',
            Z: 'Z',
            J: 'J',
            L: 'L'
        };
        if (type) {
            this.type = type;
        } else {
            this.type = this.randomType();
        }
    }

    private randomType(): PieceType {
        const keys = Object.keys(this.types) as PieceType[];
        return keys[Math.floor(Math.random() * keys.length)] ?? 'I';
    }
}

export default Piece;
