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
    private genQuiets: boolean = true;
    private moves: Array<Move> = [];
    private board: BitBoard = new BitBoard("8/8/8/8/8/8/8/8 - - -");
    private inCheck: boolean = false;
    private inDoubleCheck: boolean = false;
    private pinsExist: boolean = false;
    private checkRayBitMask: bigint = BigInt(0);
    private pinRayBitMask: bigint = BigInt(0);
    private opponentKnightAttacks: bigint = BigInt(0);
    private opponentAttackMapNoPawns: bigint = BigInt(0);
    opponentAttackMap: bigint = BigInt(0);
    opponentPawnAttackMap: bigint = BigInt(0);
    private opponentSlidingAttackMap: bigint = BigInt(0);

    private isWhiteToMove: boolean = true;
    private friendlyColor: number = Piece.white;
    private opponentColor: number = Piece.black;
    private friendlyKingSquare: number = -1;
    private friendlyColorIndex: number = BitBoard.whiteIndex;
    private opponentColorIndex: number = BitBoard.blackIndex;

    private PMD: PrecomputedMoveData = new PrecomputedMoveData();

    static returnMoves(moves: Array<Move>) {
        // console.log(moves);
         return moves.map((move) => {
             return Move.toString(move);
         });
    }



    generateMoves(board: BitBoard, output: Array<Move>, includeQueitMoves = true) {
        this.genQuiets = includeQueitMoves;

        this.initiateVariables(board);

        this.calculateAttackData();

        
        this.genKingMoves(output);
         
        if (this.inDoubleCheck) {
            return this.moves;
        }
        this.genSlidingMoves(output);
        this.genKnightMoves(output);
        this.genPawnMoves(output);
		// console.log(output.length);
    }

    initiateVariables(board: BitBoard) {
        // console.log(board);
        this.board = board
        this.moves = [];
        this.isWhiteToMove = this.board.activeColor === Piece.white;
        this.friendlyColor = this.board.activeColor;
        this.opponentColor = this.board.opponentColor;
        this.friendlyColorIndex = this.board.whiteToMove ? BitBoard.whiteIndex : BitBoard.blackIndex;
        this.friendlyKingSquare = this.board.kings[this.friendlyColorIndex];
        this.opponentColorIndex = 1 - this.friendlyColorIndex;
        
        this.inCheck = false;
        this.inDoubleCheck = false;
        this.pinsExist = false;
        this.checkRayBitMask = BigInt(0);
        this.pinRayBitMask = BigInt(0);
    }

    genKingMoves(output: Array<Move>) {

        // console.log(output);
        for (let i = 0; i < pmd.kingMoves[this.friendlyKingSquare].length; i++){
            // console.log(i);
            const targetSquare = pmd.kingMoves[this.friendlyKingSquare][i];
            const targetSquarePiece = this.board.squares[targetSquare];
            // console.log(targetSquarePiece);
            // console.log(this.friendlyColor)

            if (Piece.isColor(targetSquarePiece, this.friendlyColor)) {
                continue;
            }

            const isCapture = Piece.isColor(targetSquarePiece, this.opponentColor);
            if (!isCapture) {
                if (!this.genQuiets || this.squareIsInCheckRay(targetSquare)) { 
                    continue;
                }
            }

            // console.log(!this.squareIsAttacked(targetSquare))
            if (!this.squareIsAttacked(targetSquare)) { 
                // console.log(targetSquare);
                output.push(new Move(this.friendlyKingSquare, targetSquare))

                if (!isCapture && !this.inCheck) {
                    //kingside
                    if ((targetSquare == BoardRepresentation.f1 || targetSquare == BoardRepresentation.f8 ) && this.hasKingSideCastlingRight()) {
                        const castleSquare = targetSquare + 1;
                        if (this.board.squares[castleSquare] == Piece.none) {
                            if (!this.squareIsAttacked(castleSquare)) {
                                output.push(new Move(this.friendlyKingSquare, castleSquare, Flag.castling));
                            }
                        }
                    }
                    //queenside
                    if ((targetSquare == BoardRepresentation.d1 || targetSquare == BoardRepresentation.d8) && this.hasQueenSideCastlingRight()) {
                        const castleSquare = targetSquare - 1;
                        if (this.board.squares[castleSquare] == Piece.none && this.board.squares[castleSquare - 1] == Piece.none) {
                            if (!this.squareIsAttacked(castleSquare)) {
                                output.push(new Move(this.friendlyKingSquare, castleSquare, Flag.castling))
                            }
                        }
                    }
                }
            }
            
        }

        // console.log(output);
    }


	hasKingSideCastlingRight(){

		const mask = (this.board.whiteToMove) ? 1 : 4;
		return (this.board.currentGameState & mask) != 0;
	}

	hasQueenSideCastlingRight() {

		const mask = (this.board.whiteToMove) ? 2 : 8;
		return (this.board.currentGameState & mask) != 0;
		
	}

    genSlidingMoves(output: Array<Move>) {
        // console.log(this.returnMoves(this.moves));
        const rooks = this.board.rooks[this.friendlyColorIndex];
        for (let i = 0; i < rooks.size(); i++) {
            this.genSlidingPieceMoves(rooks.get(i), 0, 4, output)
        }
        const bishops = this.board.bishops[this.friendlyColorIndex];
        for (let i = 0; i < bishops.size(); i++) {
            this.genSlidingPieceMoves(bishops.get(i), 4, 8, output)
        }
        const queens = this.board.queens[this.friendlyColorIndex];
        for (let i = 0; i < queens.size(); i++) {
            this.genSlidingPieceMoves(queens.get(i), 0, 8, output)
        }
        // console.log(this.returnMoves(this.moves));
    }

    genSlidingPieceMoves(startSquare: number, startDirIndex: number, endDirIndex: number, output: Array<Move>) {
        const isPinned = this.isPinned(startSquare);
        // console.log(isPinned)
        // console.log(this.inCheck);
        if (this.inCheck && isPinned) {
            return;
        }
        // console.log("startSquare: " + this.boardRepresentation.getSquareNameFromIndex(startSquare))

        // direction index is used to find the possible direction from pmd.directionOffsets
        // which looks like N, W, S, E, NW, SE, NE, SW meaning if startDirIndex is 0 and endDirIndex is 3
        // we only generate for directions N, W, S, and E.
        for (let dirIndex = startDirIndex; dirIndex < endDirIndex; dirIndex++) {
            const curDirOffset = pmd.directionOffsets[dirIndex];
            // console.log(curDirOffset + " dirOffset")

            // console.log(BoardRepresentation.getSquareNameFromIndex(startSquare));
            // console.log(!this.isMovingAlongRay(curDirOffset, this.friendlyKingSquare, startSquare))
            if (isPinned && !this.isMovingAlongRay(curDirOffset, this.friendlyKingSquare, startSquare)) {
                continue;
            }
            

            for (let i = 0; i < PrecomputedMoveData.numSquaresToEdge[startSquare][dirIndex]; i++) {
                const targetSquare = startSquare + curDirOffset * (i + 1);
                const targetSquarePiece = this.board.squares[targetSquare];

                // console.log(this.boardRepresentation.getSquareNameFromIndex(targetSquare))

                if (Piece.isColor(targetSquarePiece, this.friendlyColor)) {
                    break;
                }
                // console.log(Move.toString(new Move(startSquare, targetSquare)));

                const isCapture = targetSquarePiece != Piece.none;
                const movePreventsCheck = this.squareIsInCheckRay(targetSquare);
                if (!this.inCheck || movePreventsCheck) {
                    if (this.genQuiets || isCapture) {
                        // console.log(isCapture);
                        // console.log("move added")
                        const move = new Move(startSquare, targetSquare);
                        // console.log(move.getMove().toString(2));
                        output.push(move)
                    }
                }
                if (isCapture || movePreventsCheck) {
                    break;
                }
            }
        }
    }

    genKnightMoves(output: Array<Move>) {
        const myKnights = this.board.knights[this.friendlyColorIndex];

        for (let i = 0; i < myKnights.size(); i++) {
            const startSquare = myKnights.get(i);

            // console.log("startSquare: " + this.boardRepresentation.getSquareNameFromIndex(startSquare))
            if (this.isPinned(startSquare)) {
                continue;
            }


            // console.log(pmd.knightMoves)
            for (let knightMoveIndex = 0; knightMoveIndex < pmd.knightMoves[startSquare].length; knightMoveIndex++) {
                const targetSquare = pmd.knightMoves[startSquare][knightMoveIndex];
                const targetSquarePiece = this.board.squares[targetSquare];

                // console.log(this.boardRepresentation.getSquareNameFromIndex(targetSquare))

                if  (Piece.isColor(targetSquarePiece, this.friendlyColor)) {
                    continue;
                }
                const isCapture = targetSquarePiece != Piece.none;
                const movePreventsCheck = this.squareIsInCheckRay(targetSquare); 


                if (movePreventsCheck || !this.inCheck) {
                    if (this.genQuiets || isCapture) { 
                        // console.log("move added")
                        const move = new Move(startSquare, targetSquare);
                        // console.log(move.getMove().toString(2));
                        output.push(move);
                    }
                }            
            }
        }
    }

    genPawnMoves(output: Array<Move>) {
        // console.log("here")
        const myPawns = this.board.pawns[this.friendlyColorIndex];
        const pawnOffset = this.friendlyColor == Piece.white ? 8 : -8;
        const startRank = this.friendlyColor == Piece.white ? 1 : 6;
        const finalSquareBeforePromotion = this.friendlyColor == Piece.white ? 6 : 1;

        const enPassantFile = (this.board.currentGameState >> 4 & 15) - 1;
        let enPassantSquare = -1;
        if (enPassantFile != -1) {
            enPassantSquare = 8 * (this.board.whiteToMove ? 5 : 2) + enPassantFile; 
            // console.log(enPassantSquare)
        }

        for (let i = 0; i < myPawns.size(); i++) {
            const startSquare = myPawns.get(i);
            const rank = BoardRepresentation.getRankIndex(startSquare);
            const oneStepFromPromotion = rank == finalSquareBeforePromotion;


            if (this.genQuiets) {
                const squareOneForward = startSquare + pawnOffset;

                if (this.board.squares[squareOneForward] == Piece.none) {
                    if (!this.isPinned(startSquare) || this.isMovingAlongRay(pawnOffset, startSquare, this.friendlyKingSquare)) { 
                        if (!this.inCheck || this.squareIsInCheckRay(squareOneForward)) {
                            if (oneStepFromPromotion) {
                                this.makePromotionMoves(startSquare, squareOneForward, output);
                            }
                            else {
                                output.push(new Move(startSquare, squareOneForward));
                            }
                        }
                        if (rank == startRank) {
                            const squareTwoForward = squareOneForward + pawnOffset;
                            if(this.board.squares[squareTwoForward] == Piece.none) {
                                if (!this.inCheck || this.squareIsInCheckRay(squareTwoForward)) {
                                    output.push(new Move(startSquare, squareTwoForward, Flag.pawnTwoForward));
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

                    if (this.isPinned(startSquare) && !this.isMovingAlongRay(pawnCaptureDir, this.friendlyKingSquare, startSquare)) {
                        // console.log("here")
                        continue;
                    }
                    

                    if (Piece.isColor(targetSquarePiece, this.opponentColor)) {
                        if(this.inCheck && !this.squareIsInCheckRay(targetSquare)) {
                            continue;
                        }
                        
                        if (oneStepFromPromotion) {
                            this.makePromotionMoves(startSquare, targetSquare, output)
                        }
                        else {
                            output.push(new Move(startSquare, targetSquare));
                        }
                    }
                    if (targetSquare === enPassantSquare) {
                        const epCapturedPawnSquare = targetSquare + (this.board.whiteToMove ? -8 : 8);
                        if (!this.inCheckAfterEnPassant(startSquare, targetSquare, epCapturedPawnSquare)) {
                            output.push(new Move(startSquare, targetSquare, Flag.enPassantCapture));
                        }

                    }
                }
            }
        }
        
    }

	makePromotionMoves(fromSquare: number, toSquare: number, output: Array<Move>) {
		output.push(new Move (fromSquare, toSquare, Flag.promoteToQueen));
		if (this.promotionsToGenerate == PromotionMode.All) {
			output.push(new Move (fromSquare, toSquare, Flag.promoteToKnight));
			output.push(new Move (fromSquare, toSquare, Flag.promoteToRook));
			output.push(new Move (fromSquare, toSquare, Flag.promoteToBishop));
		} else if (this.promotionsToGenerate == PromotionMode.QueenAndKnight) {
			output.push(new Move (fromSquare, toSquare, Flag.promoteToKnight));
		}
	}


	isMovingAlongRay (rayDir: number, startSquare: number, targetSquare: number) {
		const moveDir = pmd.directionLookup[targetSquare - startSquare + 63];
        // console.log(rayDir.toString(2));
        // console.log(moveDir.toString(2));
		return (rayDir == moveDir || -rayDir == moveDir);
	}


	isPinned (square: number) {
		return this.pinsExist && ((this.pinRayBitMask >> BigInt(square)) & BigInt(1)) != BigInt(0);
	}

	squareIsInCheckRay (square: number) {
		return this.inCheck && ((this.checkRayBitMask >> BigInt(square)) & BigInt(1)) != BigInt(0);
	}

	genSlidingAttackMap() {
        this.opponentSlidingAttackMap = BigInt(0);

		const enemyRooks = this.board.rooks[this.opponentColorIndex];
		for (let i = 0; i < enemyRooks.size(); i++) {
			this.updateSlidingAttackPiece(enemyRooks.get(i), 0, 4);
		}

		const enemyQueens = this.board.queens[this.opponentColorIndex];
		for (let i = 0; i < enemyQueens.size(); i++) {
			this.updateSlidingAttackPiece (enemyQueens.get(i), 0, 8);
		}

		const enemyBishops = this.board.bishops[this.opponentColorIndex];
		for (let i = 0; i < enemyBishops.size(); i++) {
			this.updateSlidingAttackPiece (enemyBishops.get(i), 4, 8);
		}
        // console.log(this.opponentSlidingAttackMap.toString(2))
	}

	updateSlidingAttackPiece(startSquare: number, startDirIndex: number, endDirIndex: number) {

		for (let directionIndex = startDirIndex; directionIndex < endDirIndex; directionIndex++) {
			const currentDirOffset = pmd.directionOffsets[directionIndex];
			for (let n = 0; n < pmd.numSquaresToEdge[startSquare][directionIndex]; n++) {
				const targetSquare = startSquare + currentDirOffset * (n + 1);
				const targetSquarePiece = this.board.squares[targetSquare];
				this.opponentSlidingAttackMap |= BigInt(1) << BigInt(targetSquare);
                //break if encountering a piece in this direction 
				if (targetSquare != this.friendlyKingSquare) {
					if (targetSquarePiece != Piece.none) {
						break;
					}
				}
			}
		}
	}

	calculateAttackData() {
		this.genSlidingAttackMap();
		// Search squares in all directions around friendly king for checks/pins by enemy sliding pieces (queen, rook, bishop)
		let startDirIndex = 0;
		let endDirIndex = 8;

		if (this.board.queens[this.opponentColorIndex].size() == 0) {
			startDirIndex = (this.board.rooks[this.opponentColorIndex].size() > 0) ? 0 : 4;
			endDirIndex = (this.board.bishops[this.opponentColorIndex].size() > 0) ? 8 : 4;
		}

		for (let dir = startDirIndex; dir < endDirIndex; dir++) {
            // console.log(dir);
			const isDiagonal = dir > 3;

			const n = pmd.numSquaresToEdge[this.friendlyKingSquare][dir];
			const directionOffset = pmd.directionOffsets[dir];
			let isFriendlyPieceAlongRay = false;
			let rayMask = BigInt(0);

			for (let i = 0; i < n; i++) {
				const squareIndex = this.friendlyKingSquare + directionOffset * (i + 1);
                // console.log(squareIndex);
				rayMask |= BigInt(1) << BigInt(squareIndex);
				const piece = this.board.squares[squareIndex];
                // console.log(piece);

				// This square contains a piece
				if (piece != Piece.none) {
					if (Piece.isColor(piece, this.friendlyColor)) {
						// First friendly piece we have come across in this direction, so it might be pinned
						if (!isFriendlyPieceAlongRay) {
							isFriendlyPieceAlongRay = true;
						}
						// This is the second friendly piece we've found in this direction, therefore pin is not possible
						else {
							break;
						}
					}
					// This square contains an enemy piece
					else {
						const pieceType = Piece.getPieceType(piece);
                        // console.log(`pieceType ${pieceType}`)

                        // console.log(Piece.isBishopOrQueen(pieceType))
                        // console.log(isDiagonal)
						// Check if piece is in bitmask of pieces able to move in current direction
						if (isDiagonal && Piece.isBishopOrQueen(pieceType) || !isDiagonal && Piece.isRookOrQueen(pieceType)) {
                            // console.log("here")
							// Friendly piece blocks the check, so this is a pin
							if (isFriendlyPieceAlongRay) {
								this.pinsExist = true;
								this.pinRayBitMask |= rayMask;
							}
							// No friendly piece blocking the attack, so this is a check
							else {
                                // console.log(`check ${squareIndex}`)
								this.checkRayBitMask |= rayMask;
								this.inDoubleCheck = this.inCheck; // if already in check, then this is double check
								this.inCheck = true;
							}
							break;
						} else {
							// This enemy piece is not able to move in the current direction, and so is blocking any checks/pins
							break;
						}
					}
				}
			}
			// Stop searching for pins if in double check, as the king is the only piece able to move in that case anyway
			if (this.inDoubleCheck) {
				break;
			}

		}

		// Knight attacks
		const opponentKnights = this.board.knights[this.opponentColorIndex];
		this.opponentKnightAttacks = BigInt(0);
		let isKnightCheck = false;

		for (let knightIndex = 0; knightIndex < opponentKnights.size(); knightIndex++) {
			const startSquare = opponentKnights.get(knightIndex);
			this.opponentKnightAttacks |= pmd.knightAttackBitboards[startSquare];

			if (!isKnightCheck && BitBoard.containsSquare(this.opponentKnightAttacks, this.friendlyKingSquare)) {
				isKnightCheck = true;
				this.inDoubleCheck = this.inCheck; // if already in check, then this is double check
				this.inCheck = true;
				this.checkRayBitMask |= BigInt(1) << BigInt(startSquare);
			}
		}

		// Pawn attacks
		const opponentPawns = this.board.pawns[this.opponentColorIndex];
		this.opponentPawnAttackMap = BigInt(0);
		let  isPawnCheck = false;

		for (let pawnIndex = 0; pawnIndex < opponentPawns.size(); pawnIndex++) {
			const pawnSquare = opponentPawns.get(pawnIndex);
			const pawnAttacks: bigint = pmd.pawnAttackBitboards[pawnSquare][this.opponentColorIndex];
            // console.log(pmd.pawnAttackBitboards[pawnSquare][this.opponentColorIndex])
            // console.log(pawnAttacks);
			this.opponentPawnAttackMap |= pawnAttacks;

			if (!isPawnCheck && BitBoard.containsSquare (pawnAttacks, this.friendlyKingSquare)) {
				isPawnCheck = true;
				this.inDoubleCheck = this.inCheck; // if already in check, then this is double check
				this.inCheck = true;
				this.checkRayBitMask |= BigInt(1) << BigInt(pawnSquare);
			}
		}

		const enemyKingSquare = this.board.kings[this.opponentColorIndex];

		this.opponentAttackMapNoPawns = this.opponentSlidingAttackMap | this.opponentKnightAttacks | pmd.kingAttackBitboards[enemyKingSquare];
		this.opponentAttackMap = this.opponentAttackMapNoPawns | this.opponentPawnAttackMap;
	}

	squareIsAttacked (square: number) {
        // console.log(square)
        // console.log(this.opponentAttackMap.toString(2))
		return BitBoard.containsSquare(this.opponentAttackMap, square);
	}

	inCheckAfterEnPassant (startSquare: number, targetSquare: number, epCapturedPawnSquare: number) {
		// Update this.board to reflect en-passant capture
		this.board.squares[targetSquare] = this.board.squares[startSquare];
		this.board.squares[startSquare] = Piece.none;
		this.board.squares[epCapturedPawnSquare] = Piece.none;

		let inCheckAfterEpCapture = false;
		if (this.squareAttackedAfterEPCapture(epCapturedPawnSquare, startSquare)) {
			inCheckAfterEpCapture = true;
		}

		// Undo change to this.board
		this.board.squares[targetSquare] = Piece.none;
		this.board.squares[startSquare] = Piece.pawn | this.friendlyColor;
		this.board.squares[epCapturedPawnSquare] = Piece.pawn | this.opponentColor;
		return inCheckAfterEpCapture;
	}

	squareAttackedAfterEPCapture (epCaptureSquare: number, capturingPawnStartSquare: number) {
		if (BitBoard.containsSquare(this.opponentAttackMapNoPawns, this.friendlyKingSquare)) {
			return true;
		}

		// Loop through the horizontal direction towards ep capture to see if any enemy piece now attacks king
		const dirIndex = (epCaptureSquare < this.friendlyKingSquare) ? 2 : 3;
		for (let i = 0; i < pmd.numSquaresToEdge[this.friendlyKingSquare][dirIndex]; i++) {
			const squareIndex = this.friendlyKingSquare + pmd.directionOffsets[dirIndex] * (i + 1);
			const piece = this.board.squares[squareIndex];
			if (piece != Piece.none) {
				// Friendly piece is blocking view of this square from the enemy.
				if (Piece.isColor(piece, this.friendlyColor)) {
					break;
				}
				// This square contains an enemy piece
				else {
					if (Piece.isRookOrQueen(piece)) {
						return true;
					} else {
						// This piece is not able to move in the current direction, and is therefore blocking any checks along this line
						break;
					}
				}
			}
		}

		// check if enemy pawn is controlling this square (can't use pawn attack bitboard, because pawn has been captured)
		for (let i = 0; i < 2; i++) {
			// Check if square exists diagonal to friendly king from which enemy pawn could be attacking it
			if (pmd.numSquaresToEdge[this.friendlyKingSquare][pmd.pawnAttackDirections[this.friendlyColorIndex][i]] > 0) {
				// move in direction friendly pawns attack to get square from which enemy pawn would attack
				const piece = this.board.squares[this.friendlyKingSquare + pmd.directionOffsets[pmd.pawnAttackDirections[this.friendlyColorIndex][i]]];
				if (piece == (Piece.pawn | this.opponentColor)) // is enemy pawn
				{
					return true;
				}
			}
		}

		return false;
	}
}
