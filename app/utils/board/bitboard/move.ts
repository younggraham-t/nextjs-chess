import BitBoard from './bitboards';
import BoardRepresentation from './board-representation';
import MoveGenerator from './move-generator';
import Piece from './piece';

export class Flag {
    static none = 0;
    static enPassantCapture = 1;
    static castling = 2;
    static promoteToQueen = 3;
    static promoteToKnight = 4;
    static promoteToRook = 5;
    static promoteToBishop = 6;
    static pawnTwoForward = 7;
    static canceledMove = 8;

    static getFlagName(flag: number) {
        const flagsToNames: Record<number, string> = {
            0: '',
            1: 'ep',
            2: 'c',
            3: 'pq',
            4: 'pn',
            5: 'pr',
            6: 'pb',
            7: 'ptf',
        }

        return flagsToNames[flag];
    }
}
export default class Move {
    private move: number = 0;

    private startSquareMask = 0b0000000000111111;
    private targetSquareMask = 0b0000111111000000;
    // private flagMask = 0b1111000000000000;


    constructor(from: number, to: number, flags = 0) {
        this.move = ((flags & 0xf) << 12) | ((to & 0x3f) << 6) | (from & 0x3f);
    }

    getStartSquare() {
        return this.move & this.startSquareMask;
    }

    getTargetSquare() {
        return (this.move & this.targetSquareMask) >> 6;
    }

    getMoveFlag() {
        return this.move >> 12;
    }

    isPromotion() {
        const flag = this.getMoveFlag();
        return flag == Flag.promoteToRook || flag == Flag.promoteToQueen ||
            flag == Flag.promoteToBishop || flag == Flag.promoteToKnight;
    }

    getPromotionPieceType() {
        switch (this.getMoveFlag()) {
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

    static getInvalidMove() {
        return new Move(0, 0, 0);
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
    static toString(move: Move) {
        const startSquare = move.getStartSquare();
        const targetSquare = move.getTargetSquare();
        // console.log(targetSquare);
        const startSquareName =
            BoardRepresentation.getSquareNameFromIndex(startSquare);
        const targetSquareName =
            BoardRepresentation.getSquareNameFromIndex(targetSquare);
        const moveFlag = Flag.getFlagName(move.getMoveFlag());
        const output = startSquareName + targetSquareName + moveFlag;
        return output
    }

    static toAlgebraicString(move: Move, board: BitBoard, moveGenerator: MoveGenerator) {
        const startSquare = move.getStartSquare();
        const targetSquare = move.getTargetSquare();
        const startSquarePiece = board.getSquare(startSquare);
        const startSquarePieceType = Piece.getPieceType(startSquarePiece);
        const targetSquarePiece = board.getSquare(targetSquare);
        const targetSquarePieceType = Piece.getPieceType(targetSquarePiece);

        let output = startSquarePieceType == Piece.pawn ? "" : Piece.toString(startSquarePieceType).toUpperCase();

        //check if move is a capture
        if (targetSquarePieceType !== Piece.none) {
                if (startSquarePieceType == Piece.pawn) {
                output = BoardRepresentation.fileNames[BoardRepresentation.getFileIndex(startSquare)]
                }
                output += "x"
                output += BoardRepresentation.getSquareNameFromIndex(targetSquare);
        }
        else {
            output += BoardRepresentation.getSquareNameFromIndex(targetSquare);
        }

        switch (move.getMoveFlag()) {
            case Flag.castling:
                return (targetSquare == BoardRepresentation.g1 || targetSquare == BoardRepresentation.g8) ? "O-O" : "O-O-O";
            case Flag.enPassantCapture:
                output = BoardRepresentation.fileNames[BoardRepresentation.getFileIndex(startSquare)];
                output += "x";
                output += BoardRepresentation.getSquareNameFromIndex(targetSquare);
                return output;
            case Flag.promoteToQueen:
                output += "=Q";
                break;
            case Flag.promoteToRook:
                output += "=R";
                break;
            case Flag.promoteToBishop:
                output += "=B";
                break;
            case Flag.promoteToKnight:
                output += "=N";
                break;
        }

        //check if there are other moves from the position that have the same result
        //for instance if 2 of the same type of piece can move to the same square differentiate between them
        let moves = new Array<Move>();
        moveGenerator.generateMoves(board, moves);
        // console.log(moves);
        // console.log(Move.toString(move));
        for (const m of moves) {
            if (Move.isSameMove(m, move)) continue;
            const mStartSquare = m.getStartSquare();
            const mTargetSquare = m.getTargetSquare();
            const mStartPiece = board.getSquare(mStartSquare);
            if (Piece.getPieceType(mStartPiece) == startSquarePieceType && mTargetSquare == targetSquare) {
                const mFileIndex = BoardRepresentation.getFileIndex(m.getStartSquare());
                const fileIndex = BoardRepresentation.getFileIndex(startSquare);
                // console.log(mFileIndex);
                // console.log(fileIndex);

                if (mFileIndex != fileIndex) {
                    output = output.slice(0,1) + BoardRepresentation.fileNames[fileIndex] + output.slice(1);
                }
                else {
                    output = output.slice(0,1) + BoardRepresentation.rankNames[BoardRepresentation.getRankIndex(startSquare)] + output.slice(1);
                }
            }
        }

        //check if the result is check/checkmate
        board.makeMove(move);
        moves = new Array<Move>();
        moveGenerator.generateMoves(board, moves);
        if (moves.length == 0) {
            output += "#";
            return output;
        }
        if (moveGenerator.inCheck) {
            output += "+";
        }

        
        
        
        
        return output;

    }

    static moveFromSquareIds(startSquare: string, targetSquare: string): Move {
            const startSquareSquare = {
                x: parseInt(startSquare.slice(0,1)),
                y: parseInt(startSquare.slice(1)),
                piece: Piece.none,
            };
            const startSquareIndex = BoardRepresentation.squareStartToIndex(startSquareSquare)
            const targetSquareSquare = {
                x: parseInt(targetSquare.slice(0,1)),
                y: parseInt(targetSquare.slice(1)),
                piece: Piece.none,
            }
            const targetSquareIndex = BoardRepresentation.squareStartToIndex(targetSquareSquare)
            const move = new Move(startSquareIndex, targetSquareIndex);
            return move;
    }
}
