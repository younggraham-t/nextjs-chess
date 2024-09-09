import BitBoard from "./bitboards";
import { startFen } from "../fen";
import Move from "./move";
import Piece from "./piece";

export default class MoveGenerator {
    private board: BitBoard = new BitBoard(startFen);
    private genQuiets: boolean = true;
    private moves: Array<Move> = new Array(64);

    private inCheck: boolean = false;
    private inDoubleCheck: boolean = false;

    private isWhiteToMove: boolean = true;
    private friendlyColor: number = Piece.white;
    private opponentColor: number = Piece.black;
    private friendlyKingSquare: number = 9;
    private friendlyColorIndex: number = BitBoard.whiteIndex;
    private opponentColorIndex: number = BitBoard.blackIndex;



    generateMoves(board: BitBoard, includeQueitMoves = true) {
        this.board = board;
        this.genQuiets = includeQueitMoves;

        this.initiateVariables();

        this.generateKingMoves();
    }

    initiateVariables() {
        this.isWhiteToMove = this.board.activeColor === Piece.white;
        this.friendlyColor = this.board.activeColor;
        this.opponentColor = this.board.opponentColor;
        this.friendlyColorIndex = this.board.whiteToMove ? BitBoard.whiteIndex : BitBoard.blackIndex;
        this.friendlyKingSquare = this.board.kings[this.friendlyColorIndex];
        this.opponentColorIndex = 1 - this.friendlyColorIndex;
    }

    generateKingMoves() {

    }
}
