type Matrix = number[][];

interface Position {
    x: number;
    y: number;
}

type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

class Piece {
    types: Record<PieceType, Matrix>;
    type: PieceType;
    matrix: Matrix;
    position: Position;

    constructor(type: PieceType | null = null) {
        this.types = {
            I: [[1, 1, 1, 1]],
            O: [
                [1, 1],
                [1, 1],
            ],
            T: [
                [1, 1, 1],
                [0, 1, 0]
            ],
            S: [
                [0, 1, 1],
                [1, 1, 0]
            ],
            Z: [
                [1, 1, 0],
                [0, 1, 1]
            ],
            J: [
                [1, 0, 0],
                [1, 1, 1]
            ],
            L: [
                [0, 0, 1],
                [1, 1, 1]
            ]
        };

        this.type = type || this.randomType();
        this.matrix = this.types[this.type];
        this.position = { x: 3, y: 0 }; // Position de départ classique
    }

    private randomType(): PieceType {
        const keys = Object.keys(this.types) as PieceType[];
        return keys[Math.floor(Math.random() * keys.length)];
    }

    rotate() {
        this.matrix = this.matrix[0].map((_, i) =>
            this.matrix.map(row => row[i]).reverse()
        );
    }
}

export default Piece;
