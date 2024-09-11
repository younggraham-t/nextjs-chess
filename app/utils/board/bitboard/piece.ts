

export default class Piece {
    static none: number = 0; //00000
    static king: number = 1; //00001
    static pawn: number = 2; //00010
    static knight: number = 3; //00011
    static bishop: number = 5; //00101
    static rook: number = 6; //00110
    static queen: number = 7; //00111

    static white: number = 8; //01000
    static black: number = 16; //10000

    static typeMask = 0b00111;
    static blackMask = 0b10000;
    static whiteMask = 0b01000;
    static colorMask = Piece.whiteMask | Piece.blackMask;
    
    static isColor(piece: number, color: number) {
        return (piece & Piece.colorMask) == color;
    }

    static getColor(piece: number) {
        return piece & Piece.colorMask;
    }

    static getPieceType(piece: number) {
        return piece & Piece.typeMask;
    }

    static isRookOrQueen(piece: number) {
        return (piece & 0b110) == 0b110;
    }

    static isBishopOrQueen(piece: number) {
        return (piece & 0b101) == 0b110;
    }

    static isSlidingPiece(piece: number) {
        return (piece & 0b100) != 0;
    }

    static toString(piece: number) {
       let string = ""
       if (piece === Piece.none) {
           return "";
       }
       string += Piece.getColor(piece) === Piece.white ? "w" : "b";
       const pieceType = Piece.getPieceType(piece);
       if (pieceType === Piece.pawn) {
           string += "p";
       }
       if (pieceType === Piece.knight) {
           string += "n";
       }
       if (pieceType === Piece.bishop) {
           string += "b";
       }
       if (pieceType === Piece.rook) {
           string += "r";
       }
       if (pieceType === Piece.queen) {
           string += "q";
       }
       if (pieceType === Piece.king) {
           string += "k";
       }
       return string;
    }

}
