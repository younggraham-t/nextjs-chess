import {GameColor} from "@/app/page";
import { fenToPosition } from "../fen";
import Stack from "../../stack";
import PieceList from "./piece-list";
import Piece from "./piece";
import BoardRepresentation from "./board-representation";
import Move, {Flag} from "./move";



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

    emptyList = new PieceList(0);

    allPieceLists: Record<number, PieceList> = {
			0: this.emptyList,
			1: this.emptyList,
			2: this.pawns[BitBoard.whiteIndex],
			3: this.knights[BitBoard.whiteIndex],
			4: this.emptyList,
			5: this.bishops[BitBoard.whiteIndex],
			6: this.rooks[BitBoard.whiteIndex],
			7: this.queens[BitBoard.whiteIndex],
			8: this.emptyList,
			9: this.emptyList,
			10: this.pawns[BitBoard.blackIndex],
			11: this.knights[BitBoard.blackIndex],
			12: this.emptyList,
			13: this.bishops[BitBoard.blackIndex],
			14: this.rooks[BitBoard.blackIndex],
			15: this.queens[BitBoard.blackIndex],
    }

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
            
            const piece = square.piece;
            const pieceColorIndex = Piece.isColor(piece, Piece.white) ? 0 : 1;
            console.log(`squareIndex ${squareIndex} piece ${Piece.toString(piece)} colorIndex ${pieceColorIndex}`)
            switch (Piece.getPieceType(piece)) {
                case Piece.pawn:
                    this.pawns[pieceColorIndex].addPieceAtSquare(squareIndex)
                    break;
                case Piece.knight:
                    this.knights[pieceColorIndex].addPieceAtSquare(squareIndex)
                    break;
                case Piece.bishop:
                    this.bishops[pieceColorIndex].addPieceAtSquare(squareIndex)
                    break;
                case Piece.rook:
                    this.rooks[pieceColorIndex].addPieceAtSquare(squareIndex)
                    break;
                case Piece.queen:
                    this.queens[pieceColorIndex].addPieceAtSquare(squareIndex)
                    break;
                case Piece.king:
                    this.kings[pieceColorIndex] = squareIndex;
                    break
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

        const epFileName = position.enPassant.slice(0,1);
        const epFileIndex = BoardRepresentation.fileNames.indexOf(epFileName);
        let epState = BoardRepresentation.getFileIndex(epFileIndex) << 4;
        if (epFileIndex > 7 || epFileIndex < 0) {
            epState = 8 << 4;
        }
        // console.log(epState.toString(2));
        this.halfMoveCounter = position.halfMove;
        const halfMoveState = this.halfMoveCounter << 14;
        const initialGameState = whiteCastle | blackCastle | epState | halfMoveState;
        this.gameStateHistory.push(initialGameState);
        this.currentGameState = initialGameState;
        // console.log(initialGameState.toString(2))

        this.fullMove = position.fullMove;
        // console.log(this.rooks);
        // console.log(this.kings);
        // console.log(this.squares);

    }

	getPieceList (pieceType: number, colorIndex: number) {
        return this.allPieceLists[colorIndex * 8 + pieceType]
	}
    
	// Make a move on the board
	// The inSearch parameter controls whether this move should be recorded in the game history (for detecting three-fold repetition)
	makeMove(move: Move, inSearch = false) {
		// const oldEnPassantFile = (this.currentGameState >> 4) & 15;
		const originalCastleState = this.currentGameState & 15;
		let newCastleState = originalCastleState;
		this.currentGameState = 0;

		const opponentColourIndex = 1 - this.colorToMoveIndex;
		const moveFrom = move.getStartSquare();
		const moveTo = move.getTargetSquare();

		const capturedPieceType = Piece.getPieceType(this.squares[moveTo]);
		const movePiece = this.squares[moveFrom];
		const movePieceType = Piece.getPieceType (movePiece);

		const moveFlag = move.getMoveFlag();
		const isPromotion = move.isPromotion();
		const isEnPassant = moveFlag == Flag.enPassantCapture;

		// Handle captures
		this.currentGameState |= (capturedPieceType << 8);
		if (capturedPieceType != 0 && !isEnPassant) {
			// ZobristKey ^= Zobrist.piecesArray[capturedPieceType][opponentColourIndex][moveTo];
			this.getPieceList(capturedPieceType, opponentColourIndex).removePieceAtSquare(moveTo);
		}

		// Move pieces in piece lists
		if (movePieceType == Piece.king) {
			this.kings[this.colorToMoveIndex] = moveTo;
			newCastleState &= (this.whiteToMove) ? this.whiteCastleMask : this.blackCastleMask;
		} else {
			this.getPieceList (movePieceType, this.colorToMoveIndex).movePiece(moveFrom, moveTo);
		}

		let pieceOnTargetSquare = movePiece;

		// Handle promotion
		if (isPromotion) {
			let promoteType = 0;
			switch (moveFlag) {
				case Flag.promoteToQueen:
					promoteType = Piece.queen;
					this.queens[this.colorToMoveIndex].addPieceAtSquare(moveTo);
					break;
				case Flag.promoteToRook:
					promoteType = Piece.rook;
					this.rooks[this.colorToMoveIndex].addPieceAtSquare (moveTo);
					break;
				case Flag.promoteToBishop:
					promoteType = Piece.bishop;
					this.bishops[this.colorToMoveIndex].addPieceAtSquare (moveTo);
					break;
				case Flag.promoteToKnight:
					promoteType = Piece.knight;
					this.knights[this.colorToMoveIndex].addPieceAtSquare (moveTo);
					break;

			}
			pieceOnTargetSquare = promoteType | this.activeColor;
			this.pawns[this.colorToMoveIndex].removePieceAtSquare (moveTo);
		} else {
			// Handle other special moves (en-passant, and castling)
			switch (moveFlag) {
				case Flag.enPassantCapture:
					const epPawnSquare = moveTo + ((this.activeColor == Piece.white) ? -8 : 8);
					this.currentGameState |= (this.squares[epPawnSquare] << 8); // add pawn as capture type
					this.squares[epPawnSquare] = 0; // clear ep capture square
					this.pawns[opponentColourIndex].removePieceAtSquare (epPawnSquare);
					// ZobristKey ^= Zobrist.piecesArray[Piece.Pawn][opponentColourIndex][epPawnSquare];
					break;
				case Flag.castling:
					const kingside = moveTo == BoardRepresentation.g1 || moveTo == BoardRepresentation.g8;
					const castlingRookFromIndex = (kingside) ? moveTo + 1 : moveTo - 2;
					const castlingRookToIndex = (kingside) ? moveTo - 1 : moveTo + 1;

					this.squares[castlingRookFromIndex] = Piece.none;
					this.squares[castlingRookToIndex] = Piece.rook | this.activeColor;

					this.rooks[this.colorToMoveIndex].movePiece (castlingRookFromIndex, castlingRookToIndex);
					// ZobristKey ^= Zobrist.piecesArray[Piece.Rook][this.colorToMoveIndex][castlingRookFromIndex];
					// ZobristKey ^= Zobrist.piecesArray[Piece.Rook][this.colorToMoveIndex][castlingRookToIndex];
					break;
			}
		}

		// Update the board representation:
		this.squares[moveTo] = pieceOnTargetSquare;
		this.squares[moveFrom] = 0;

		// Pawn has moved two forwards, mark file with en-passant flag
		if (moveFlag == Flag.pawnTwoForward) {
			const file = BoardRepresentation.getFileIndex(moveFrom) + 1;
			this.currentGameState |= (file << 4);
			// ZobristKey ^= Zobrist.enPassantFile[file];
		}

		// Piece moving to/from rook square removes castling right for that side
		if (originalCastleState != 0) {
			if (moveTo == BoardRepresentation.h1 || moveFrom == BoardRepresentation.h1) {
				newCastleState &= this.whiteCastleKingSideMask;
			} else if (moveTo == BoardRepresentation.a1 || moveFrom == BoardRepresentation.a1) {
				newCastleState &= this.whiteCastleQueenSideMask;
			}
			if (moveTo == BoardRepresentation.h8 || moveFrom == BoardRepresentation.h8) {
				newCastleState &= this.blackCastleKingSideMask;
			} else if (moveTo == BoardRepresentation.a8 || moveFrom == BoardRepresentation.a8) {
				newCastleState &= this.blackCastleQueenSideMask;
			}
		}

		// Update zobrist key with new piece position and side to move
		// ZobristKey ^= Zobrist.sideToMove;
		// ZobristKey ^= Zobrist.piecesArray[movePieceType][this.colorToMoveIndex][moveFrom];
		// ZobristKey ^= Zobrist.piecesArray[Piece.getPieceType(pieceOnTargetSquare)][this.colorToMoveIndex][moveTo];

		// if (oldEnPassantFile != 0)
		// 	ZobristKey ^= Zobrist.enPassantFile[oldEnPassantFile];

		// if (newCastleState != originalCastleState) {
		// 	ZobristKey ^= Zobrist.castlingRights[originalCastleState]; // remove old castling rights state
		// 	ZobristKey ^= Zobrist.castlingRights[newCastleState]; // add new castling rights state
		// }
		this.currentGameState |= newCastleState;
		this.currentGameState |= this.halfMoveCounter << 14;
		this.gameStateHistory.push(this.currentGameState);

		// Change side to move
		this.whiteToMove = !this.whiteToMove;
		this.activeColor = (this.whiteToMove) ? Piece.white : Piece.black;
		this.opponentColor = (this.whiteToMove) ? Piece.black : Piece.white;
		this.colorToMoveIndex = 1 - this.colorToMoveIndex;
		this.fullMove++;
		this.halfMoveCounter++;

		if (!inSearch) {
			if (movePieceType == Piece.pawn || capturedPieceType != Piece.none) {
				// RepetitionPositionHistory.clear ();
				this.halfMoveCounter = 0;
			} else {
				// RepetitionPositionHistory.push(ZobristKey);
			}
		}

        return this.squares;
	}

	//// Undo a move previously made on the board
	//unmakeMove(Move move, boolean inSearch) {

	//	//const opponentColour = this.activeColor;
	//	const opponentColourIndex = this.colorToMoveIndex;
	//    const undoingWhiteMove = this.opponentColor == Piece.white;
	//	this.activeColor = this.opponentColor; // side who made the move we are undoing
	//	this.opponentColor = (undoingWhiteMove) ? Piece.black : Piece.white;
	//	this.colorToMoveIndex = 1 - this.colorToMoveIndex;
	//	this.whiteToMove = !this.whiteToMove;

	//	const originalCastleState = this.currentGameState & 0b1111;

	//	const capturedPieceType = (this.currentGameState >> 8) & 63;
	//	const capturedPiece = (capturedPieceType == 0) ? 0 : capturedPieceType | this.opponentColor;

	//	const movedFrom = move.getStartSquare();
	//	const movedTo = move.getTargetSquare();
	//	const moveFlags = move.getMoveFlag();
	//	const isEnPassant = moveFlags == Flag.enPassantCapture;
	//	const isPromotion = move.isPromotion();

	//	const toSquarePieceType = Piece.getPieceType (this.squares[movedTo]);
	//	const movedPieceType = (isPromotion) ? Piece.pawn : toSquarePieceType;

	//	// Update zobrist key with new piece position and side to move
	//	// ZobristKey ^= Zobrist.sideToMove;
	//	// ZobristKey ^= Zobrist.piecesArray[movedPieceType][this.colorToMoveIndex][movedFrom]; // add piece back to square it moved from
	//	// ZobristKey ^= Zobrist.piecesArray[toSquarePieceType][this.colorToMoveIndex][movedTo]; // remove piece from square it moved to

	//	const oldEnPassantFile = (this.currentGameState >> 4) & 15;
	//	if (oldEnPassantFile != 0)
	//		ZobristKey ^= Zobrist.enPassantFile[oldEnPassantFile];

	//	// ignore ep captures, handled later
	//	if (capturedPieceType != 0 && !isEnPassant) {
	//		ZobristKey ^= Zobrist.piecesArray[capturedPieceType][opponentColourIndex][movedTo];
	//		this.getPieceList (capturedPieceType, opponentColourIndex).addPieceAtSquare (movedTo);
	//	}

	//	// Update king index
	//	if (movedPieceType == Piece.King) {
	//		this.kings[this.colorToMoveIndex] = movedFrom;
	//	} else if (!isPromotion) {
	//		this.getPieceList (movedPieceType, this.colorToMoveIndex).movePiece (movedTo, movedFrom);
	//	}

	//	// put back moved piece
	//	this.squares[movedFrom] = movedPieceType | this.activeColor; // note that if move was a pawn promotion, this will put the promoted piece back instead of the pawn. Handled in special move switch
	//	this.squares[movedTo] = capturedPiece; // will be 0 if no piece was captured

	//	if (isPromotion) {
	//		pawns[this.colorToMoveIndex].addPieceAtSquare (movedFrom);
	//		switch (moveFlags) {
	//			case Flag.PromoteToQueen:
	//				queens[this.colorToMoveIndex].removePieceAtSquare (movedTo);
	//				break;
	//			case Flag.PromoteToKnight:
	//				knights[this.colorToMoveIndex].removePieceAtSquare (movedTo);
	//				break;
	//			case Flag.PromoteToRook:
	//				this.rooks[this.colorToMoveIndex].removePieceAtSquare (movedTo);
	//				break;
	//			case Flag.PromoteToBishop:
	//				bishops[this.colorToMoveIndex].removePieceAtSquare (movedTo);
	//				break;
	//		}
	//	} else if (isEnPassant) { // ep cature: put captured pawn back on right square
	//		const epIndex = movedTo + ((this.activeColor == Piece.White) ? -8 : 8);
	//		this.squares[movedTo] = 0;
	//		this.squares[epIndex] = (const) capturedPiece;
	//		pawns[opponentColourIndex].addPieceAtSquare (epIndex);
	//		ZobristKey ^= Zobrist.piecesArray[Piece.Pawn][opponentColourIndex][epIndex];
	//	} else if (moveFlags == Flag.Castling) { // castles: move rook back to starting square

	//		boolean kingside = movedTo == 6 || movedTo == 62;
	//		const castlingRookFromIndex = (kingside) ? movedTo + 1 : movedTo - 2;
	//		const castlingRookToIndex = (kingside) ? movedTo - 1 : movedTo + 1;

	//		this.squares[castlingRookToIndex] = 0;
	//		this.squares[castlingRookFromIndex] = Piece.Rook | this.activeColor;

	//		this.rooks[this.colorToMoveIndex].movePiece (castlingRookToIndex, castlingRookFromIndex);
	//		ZobristKey ^= Zobrist.piecesArray[Piece.Rook][this.colorToMoveIndex][castlingRookFromIndex];
	//		ZobristKey ^= Zobrist.piecesArray[Piece.Rook][this.colorToMoveIndex][castlingRookToIndex];

	//	}

	//	gameStateHistory.pop(); // removes current state from history
	//	this.currentGameState = gameStateHistory.peek(); // sets current state to previous state in history

	//	fiftyMoveCounter = (const) (this.currentGameState & Integer.parseUnsignedInt("4294950912")) >> 14;
	//	const newEnPassantFile = (const) (this.currentGameState >> 4) & 15;
	//	if (newEnPassantFile != 0)
	//		ZobristKey ^= Zobrist.enPassantFile[newEnPassantFile];

	//	const newCastleState = this.currentGameState & 0b1111;
	//	if (newCastleState != originalCastleState) {
	//		ZobristKey ^= Zobrist.castlingRights[originalCastleState]; // remove old castling rights state
	//		ZobristKey ^= Zobrist.castlingRights[newCastleState]; // add new castling rights state
	//	}

	//	plyCount--;

	//	if (!inSearch && RepetitionPositionHistory.size() > 0) {
	//		RepetitionPositionHistory.pop();
	//	}

	//}



}
