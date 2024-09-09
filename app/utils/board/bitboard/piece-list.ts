export default class PieceList {
    occupiedSquares: Array<number>;

    map: Array<number>;
    numPieces: number;

    constructor(maxPieceCount = 16) {
        this.occupiedSquares = new Array(maxPieceCount);
        this.map = new Array(64);
        this.numPieces = 0;
        
    }

    size() {
        return this.numPieces;
    }

    get(position: number) {
        return this.occupiedSquares[position];
    }

    set(position: number, value: number) {
        this.occupiedSquares[position] = value;
    }

    addPieceAtSquare(square: number) {
        this.occupiedSquares[this.numPieces] = square;
        this.map[square] = this.numPieces;
        this.numPieces++;
    }

    removePieceAtSquare(square: number) {
        const pieceIndex = this.map[square];
        this.occupiedSquares[pieceIndex] = this.occupiedSquares[this.numPieces - 1];
        this.map[this.occupiedSquares[pieceIndex]] = pieceIndex;
        this.numPieces--;
    }

    movePiece(startSquare: number, targetSquare: number) {
        const pieceIndex = this.map[startSquare];
        this.occupiedSquares[pieceIndex] = targetSquare;
        this.map[targetSquare] = pieceIndex;

    }
}
