import {GameColor} from "@/app/page";
import { fenToPosition } from "../fen";
import Stack from "../../stack";
import PieceList from "./piece-list";
import Piece from "./piece";
import BoardRepresentation from "./board-representation";



export default class BitBoard {
    static whiteIndex = 0;
    static blackIndex = 1;

    squares: Array<number> = new Array(64);
    
    whiteToMove: boolean;
    activeColor: number;
    opponentColor: number;
    colorToMoveIndex: number;

    // Bits 0-3 store white and black kingside/queenside castling legality
	// Bits 4-7 store file of ep square (starting at 1, so 0 = no ep square)
	// Bits 8-13 captured piece
	// Bits 14-... fifty move counter
    gameStateHistory: Stack<number> = new Stack();
    currentGameState: number;

    fullMove: number = 0;
    halfMoveCounter: number = 0;
    
    kings: Array<number> = new Array(2); 

    rooks: Array<PieceList> = [new PieceList(10), new PieceList(10)]; 
    bishops: Array<PieceList> = [new PieceList(10), new PieceList(10)];
    queens: Array<PieceList> = [new PieceList(10), new PieceList(10)];
    knights: Array<PieceList> = [new PieceList(10), new PieceList(10)];
    pawns: Array<PieceList> = [new PieceList(10), new PieceList(10)];

    whiteCastleKingSideMask = 0b1111111111111110;
	whiteCastleQueenSideMask = 0b1111111111111101;
	blackCastleKingSideMask = 0b1111111111111011;
	blackCastleQueenSideMask = 0b1111111111110111;

    whiteCastleMask = this.whiteCastleKingSideMask & this.whiteCastleQueenSideMask;
    blackCastleMask = this.blackCastleKingSideMask & this.blackCastleQueenSideMask;



    constructor(fen: string) {
        // console.log(this.rooks.toString(2));
        const position = fenToPosition(fen);
        for (const square of position.squares) {
            const squareIndex = BoardRepresentation.squareStartToIndex(square);
            
            let piece = 0;
            if (square.piece) {
                const pieceColor = square.piece?.slice(0,1);
                // console.log(pieceColor);
                const pieceType = square.piece?.slice(1).toLowerCase();
                piece = pieceColor === "w" ? Piece.white : Piece.black;
                const pieceColorIndex = pieceColor == "w" ? BitBoard.whiteIndex : BitBoard.blackIndex;
                // console.log(i);
                // console.log(pieceType);
                // console.log(pieceColor);
                // console.log(pieceColorIndex);
                    if (pieceType == "p") {
                        piece |= Piece.pawn;
                        this.pawns[pieceColorIndex].addPieceAtSquare(squareIndex); 
                    }
                    if (pieceType == "n") {
                        piece |= Piece.knight;
                        this.knights[pieceColorIndex].addPieceAtSquare(squareIndex);
                    }
                    if (pieceType == "b") {
                        piece |= Piece.bishop;
                        this.bishops[pieceColorIndex].addPieceAtSquare(squareIndex);
                    }
                    if (pieceType == "r") {
                        piece |= Piece.rook;
                        this.rooks[pieceColorIndex].addPieceAtSquare(squareIndex);
                    }
                    if (pieceType == "q") {
                        piece |= Piece.queen;
                        this.queens[pieceColorIndex].addPieceAtSquare(squareIndex);
                    }
                    if (pieceType == "k") {
                        // console.log(`king ${piece}`)
                        piece |= Piece.king;
                        // console.log(`king2 ${piece}`)
                        this.kings[pieceColorIndex] = squareIndex;
                    }
            }
            this.squares[squareIndex] = piece;
        }
        this.activeColor = position.activeColor == GameColor.white ? Piece.white : Piece.black;
        this.whiteToMove = this.activeColor == Piece.white ? true : false;
        this.opponentColor = this.whiteToMove ? Piece.black : Piece.white;
        this.colorToMoveIndex = this.whiteToMove ? BitBoard.whiteIndex : BitBoard.blackIndex;

        let whiteCastle: number = 0;
        let blackCastle: number = 0;
        for (const char of position.castling) {
            switch (char) {
                case "K":
                    whiteCastle |= 1 << 0;
                case "Q":
                    whiteCastle |= 1 << 1;
                case "k":
                    blackCastle |= 1 << 2;
                case "q":
                    blackCastle |= 1 << 3;
            }
        }

        const epState = BoardRepresentation.getFileIndex(BoardRepresentation.fileNames.indexOf(position.enPassant));
        this.halfMoveCounter = position.halfMove;
        const halfMoveState = this.halfMoveCounter << 14;
        const initialGameState = whiteCastle | blackCastle | epState | halfMoveState;
        this.gameStateHistory.push(initialGameState);
        this.currentGameState = initialGameState;

        this.fullMove = position.fullMove;
        // console.log(this.rooks);
        // console.log(this.kings);
        // console.log(this.squares);

    }


}
