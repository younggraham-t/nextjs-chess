import BitBoard from "./bitboards";
import Move, {Flag} from "./move";
import Piece from "./piece";
import {PrecomputedMoveData as pmd, PrecomputedMoveData} from "./precomputed-move-data";
import BoardRepresentation from "./board-representation";

export enum PromotionMode {
    All,
    QueenAndKnight,
    QueenOnly,
}
export default class MoveGenerator {
    
    private promotionsToGenerate: PromotionMode = PromotionMode.All;
    private board: BitBoard;
    private genQuiets: boolean = true;
    private moves: Array<Move> = [];

    private inCheck: boolean = false;
    private inDoubleCheck: boolean = false;

    private isWhiteToMove: boolean = true;
    private friendlyColor: number = Piece.white;
    private opponentColor: number = Piece.black;
    private friendlyKingSquare: number = -1;
    private friendlyColorIndex: number = BitBoard.whiteIndex;
    private opponentColorIndex: number = BitBoard.blackIndex;

    private PMD: PrecomputedMoveData = new PrecomputedMoveData();

    returnMoves(moves: Array<Move>) {
        // console.log(moves);
         return moves.map((move) => {
             const startSquare = move.getStartSquare();
             const targetSquare = move.getTargetSquare();
             // console.log(targetSquare);
             const startSquareName = BoardRepresentation.getSquareNameFromIndex(startSquare);
             const targetSquareName = BoardRepresentation.getSquareNameFromIndex(targetSquare);
             const moveFlag = Flag.getFlagName(move.getMoveFlag());
             const output = startSquareName + targetSquareName + moveFlag;
             return output 
         });
    }

    constructor(board: BitBoard) {
        this.board = board;

    }

    generateMoves(includeQueitMoves = true) {
        this.genQuiets = includeQueitMoves;

        this.initiateVariables();

        // return ["e2e4", "e2e3", "d2d3", "d2d4", "c2c3", "c2c4"]
         this.genKingMoves();
         
         // if (this.inDoubleCheck) {
         //     return this.returnMoves(this.moves);
         // }
         this.genSlidingMoves();
         this.genKnightMoves();
         this.genPawnMoves();

        return this.moves;
    }

    initiateVariables() {
        // console.log(this.board);
        this.isWhiteToMove = this.board.activeColor === Piece.white;
        this.friendlyColor = this.board.activeColor;
        this.opponentColor = this.board.opponentColor;
        this.friendlyColorIndex = this.board.whiteToMove ? BitBoard.whiteIndex : BitBoard.blackIndex;
        this.friendlyKingSquare = this.board.kings[this.friendlyColorIndex];
        this.opponentColorIndex = 1 - this.friendlyColorIndex;
    }

    genKingMoves() {

        for (let i = 0; i < pmd.kingMoves[this.friendlyKingSquare].length; i++){
            const targetSquare = pmd.kingMoves[this.friendlyKingSquare][i];
            const targetSquarePiece = this.board.squares[targetSquare];

            if (Piece.isColor(targetSquarePiece, this.friendlyColor)) {
                continue;
            }

            const isCapture = Piece.isColor(targetSquarePiece, this.opponentColor);
            if (!isCapture) {
                if (!this.genQuiets || false) { // TODO change false to check if square is in a check
                    continue;
                }
            }

            if (true) { //TODO add function to check if square is attacked
                this.moves.push(new Move(this.friendlyKingSquare, targetSquare))

                //TODO add castling ability
                if (!isCapture && true) {//TODO add check check
                    //kingside
                    if ((targetSquare == BoardRepresentation.f1 || targetSquare == BoardRepresentation.f8 ) && this.hasKingSideCastlingRight()) {
                        const castleSquare = targetSquare + 1;
                        if (this.board.squares[castleSquare] == Piece.none) {
                            if (!false) {//TODO add check for if square is attacked
                                this.moves.push(new Move(this.friendlyKingSquare, castleSquare, Flag.castling));
                            }
                        }
                    }
                    //queenside
                    if ((targetSquare == BoardRepresentation.d1 || targetSquare == BoardRepresentation.d8) && this.hasQueenSideCastlingRight()) {
                        const castleSquare = targetSquare - 1;
                        if (this.board.squares[castleSquare] == Piece.none) {
                            if (!false) {//TODO add check for if square is attacked
                                this.moves.push(new Move(this.friendlyKingSquare, castleSquare, Flag.castling))
                            }
                        }
                    }
                }
            }
            
        }

    }


	hasKingSideCastlingRight(){

		const mask = (this.board.whiteToMove) ? 1 : 4;
		return (this.board.currentGameState & mask) != 0;
	}

	hasQueenSideCastlingRight() {

		const mask = (this.board.whiteToMove) ? 2 : 8;
		return (this.board.currentGameState & mask) != 0;
		
	}

    genSlidingMoves() {
        const rooks = this.board.rooks[this.friendlyColorIndex];
        for (let i = 0; i < rooks.size(); i++) {
            this.genSlidingPieceMoves(rooks.get(i), 0, 4)
        }
        const bishops = this.board.bishops[this.friendlyColorIndex];
        for (let i = 0; i < bishops.size(); i++) {
            this.genSlidingPieceMoves(bishops.get(i), 4, 8)
        }
        const queens = this.board.queens[this.friendlyColorIndex];
        for (let i = 0; i < queens.size(); i++) {
            this.genSlidingPieceMoves(queens.get(i), 0, 8)
        }
    }

    genSlidingPieceMoves(startSquare: number, startDirIndex: number, endDirIndex: number) {
        // TODO check for pins
        // console.log("startSquare: " + BoardRepresentation.getSquareNameFromIndex(startSquare))

        // direction index is used to find the possible direction from pmd.directionOffsets
        // which looks like N, W, S, E, NW, SE, NE, SW meaning if startDirIndex is 0 and endDirIndex is 3
        // we only generate for directions N, W, S, and E.
        for (let dirIndex = startDirIndex; dirIndex < endDirIndex; dirIndex++) {
            const curDirOffset = pmd.directionOffsets[dirIndex];
            // console.log(curDirOffset + " dirOffset")

            //TODO handle pins
            

            for (let i = 0; i < PrecomputedMoveData.numSquaresToEdge[startSquare][dirIndex]; i++) {
                const targetSquare = startSquare + curDirOffset * (i + 1);
                const targetSquarePiece = this.board.squares[targetSquare];

                // console.log(BoardRepresentation.getSquareNameFromIndex(targetSquare))

                if (Piece.isColor(targetSquarePiece, this.friendlyColor)) {
                    break;
                }

                const isCapture = targetSquarePiece != Piece.none;
                const movePreventsCheck = false; // TODO add funtion to parse checks
                if (!this.inCheck || movePreventsCheck) {
                    if (this.genQuiets || isCapture) {
                        // console.log("move added")
                        const move = new Move(startSquare, targetSquare);
                        // console.log(move.getMove().toString(2));
                        this.moves.push(move)
                    }
                }
                if (isCapture || movePreventsCheck) {
                    break;
                }
            }
        }
    }

    genKnightMoves() {
        const myKnights = this.board.knights[this.friendlyColorIndex];

        for (let i = 0; i < myKnights.size(); i++) {
            const startSquare = myKnights.get(i);

            // console.log("startSquare: " + BoardRepresentation.getSquareNameFromIndex(startSquare))
            //TODO check for pins

            // console.log(pmd.knightMoves)
            for (let knightMoveIndex = 0; knightMoveIndex < pmd.knightMoves[startSquare].length; knightMoveIndex++) {
                const targetSquare = pmd.knightMoves[startSquare][knightMoveIndex];
                const targetSquarePiece = this.board.squares[targetSquare];

                // console.log(BoardRepresentation.getSquareNameFromIndex(targetSquare))

                if  (Piece.isColor(targetSquarePiece, this.friendlyColor)) {
                    continue;
                }
                const isCapture = targetSquarePiece != Piece.none;
                const movePreventsCheck = false; //TODO implement check system


                if (movePreventsCheck || !this.inCheck) {
                    if (this.genQuiets || isCapture) { 
                        // console.log("move added")
                        const move = new Move(startSquare, targetSquare);
                        // console.log(move.getMove().toString(2));
                        this.moves.push(move);
                    }
                }            
            }
        }
    }

    genPawnMoves() {
        const myPawns = this.board.pawns[this.friendlyColorIndex];
        const pawnOffset = this.friendlyColor == Piece.white ? 8 : -8;
        const startRank = this.friendlyColor == Piece.white ? 1 : 6;
        const finalSquareBeforePromotion = this.friendlyColor == Piece.white ? 6 : 1;

        const enPassantFile = (this.board.currentGameState >> 4 & 15);
        let enPassantSquare = -1;
        if (enPassantFile != 8) {
            enPassantSquare = 8 * (this.board.whiteToMove ? 5 : 2) + enPassantFile; 
        }

        for (let i = 0; i < myPawns.size(); i++) {
            const startSquare = myPawns.get(i);
            const rank = BoardRepresentation.getRankIndex(startSquare);
            const oneStepFromPromotion = rank == finalSquareBeforePromotion;


            if (this.genQuiets) {
                const squareOneForward = startSquare + pawnOffset;

                if (this.board.squares[squareOneForward] == Piece.none) {
                    if (true) { // TODO add pin check
                        if (true) {//TODO add check check
                            if (oneStepFromPromotion) {
                                this.makePromotionMoves(startSquare, squareOneForward);
                            }
                            else {
                                this.moves.push(new Move(startSquare, squareOneForward));
                            }
                        }
                        if (rank == startRank) {
                            const squareTwoForward = squareOneForward + pawnOffset;
                            if(this.board.squares[squareTwoForward] == Piece.none) {
                                if (true) {//TODO add check check
                                    this.moves.push(new Move(startSquare, squareTwoForward, Flag.pawnTwoForward));
                                }
                            }
                        }
                    }
                }
            }
            //pawn captures
            for (let j = 0; j < 2; j++) {
                //check if diagonals exist next to pawn
                if (pmd.numSquaresToEdge[startSquare][pmd.pawnAttackDirections[this.friendlyColorIndex][j]] > 0) {
                    const pawnCaptureDir = pmd.directionOffsets[pmd.pawnAttackDirections[this.friendlyColorIndex][j]];
                    const targetSquare = startSquare + pawnCaptureDir;
                    const targetSquarePiece = this.board.squares[targetSquare];

                    //TODO add pin check
                    

                    if (Piece.isColor(targetSquarePiece, this.opponentColor)) {
                        //TODO add check check
                        
                        if (oneStepFromPromotion) {
                            this.makePromotionMoves(startSquare, targetSquare)
                        }
                        else {
                            this.moves.push(new Move(startSquare, targetSquare));
                        }
                    }
                    if (targetSquare === enPassantSquare) {
                        const epCapturedPawnSquare = targetSquare + (this.board.whiteToMove ? -8 : 8);
                        if (true) {//TODO add check check
                            this.moves.push(new Move(startSquare, targetSquare, Flag.enPassantCapture));
                        }

                    }
                }
            }
        }
        
    }

	makePromotionMoves(fromSquare: number, toSquare: number) {
		this.moves.push(new Move (fromSquare, toSquare, Flag.promoteToQueen));
		if (this.promotionsToGenerate == PromotionMode.All) {
			this.moves.push(new Move (fromSquare, toSquare, Flag.promoteToKnight));
			this.moves.push(new Move (fromSquare, toSquare, Flag.promoteToRook));
			this.moves.push(new Move (fromSquare, toSquare, Flag.promoteToBishop));
		} else if (this.promotionsToGenerate == PromotionMode.QueenAndKnight) {
			this.moves.push(new Move (fromSquare, toSquare, Flag.promoteToKnight));
		}

	}

}
