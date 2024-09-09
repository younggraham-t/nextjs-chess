import Piece from "./piece";
export class Flag {
    static none = 0;
    static enPassantCapture = 1;
    static castling = 2;
    static promoteToQueen = 3;
    static promoteToKnight = 4;
    static promoteToRook = 5;
    static promoteToBishop = 6;
    static pawnTwoForward = 7;
}
export default class Move {
    
    private move: number = 0;

    private startSquareMask = 0b0000000000111111;
	private targetSquareMask = 0b0000111111000000;
	private flagMask = 0b1111000000000000;


    constructor(from: number, to: number, flags: number) {
        this.move = ((flags & 0xf) <<12) | ((from & 0x3f) << 6) | (to & 0x3f);
    }

    getStartSquare() {
        return this.move & this.startSquareMask;
    }

    getTargetSquare() {
        return this.move & this.targetSquareMask;
    }

    getMoveFlag() {
        return this.move >> 12;
    }

    isPromotion() {
        const flag = this.getMoveFlag();
        return flag == Flag.promoteToRook || flag == Flag.promoteToQueen || flag == Flag.promoteToBishop || flag == Flag.promoteToKnight;
    }

    getPromotionPieceType() {
        switch(this.getMoveFlag()) {
            case Flag.promoteToRook:
                return Piece.rook;
            case Flag.promoteToQueen:
                return Piece.queen;
            case Flag.promoteToBishop:
                return Piece.bishop;
            case Flag.promoteToKnight:
                return Piece.knight;
            default:
                return Piece.none;
        }
    }

    getInvalidMove() {
        return new Move(0,0,0);
    }

    static isSameMove(a: Move, b: Move) {
        return a.move === b.move
    }

    getMove() {
        return this.move;
    }

    isInvalid() {
        return this.move === 0;
    }
}
