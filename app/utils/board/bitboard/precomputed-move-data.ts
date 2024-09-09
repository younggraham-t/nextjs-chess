import BitBoard from "./bitboards";
import Coord from "./coord";
import BoardRepresentation from "./board-representation";

export class PrecomputedMoveData {
	// First 4 are orthogonal, last 4 are diagonals (N, S, W, E, NW, SE, NE, SW)
	static directionOffsets: Array<number> = [ 8, -8, -1, 1, 7, -7, 9, -9 ];

	// Stores number of moves available in each of the 8 directions for every square on the board
	// Order of directions is: N, S, W, E, NW, SE, NE, SW
	// So for example, if availableSquares[0][1] == 7...
	// that means that there are 7 squares to the north of b1 (the square with index 1 in board array)
	static numSquaresToEdge: Array<Uint32Array>;

	// Stores array of indices for each square a knight can land on from any square on the board
	// So for example, knightMoves[0] is equal to {10, 17}, meaning a knight on a1 can jump to c2 and b3
	static knightMoves: Array<Uint8Array>;
	static kingMoves: Array<Uint8Array>;

	// Pawn attack directions for white and black (NW, NE; SW SE)
	static pawnAttackDirections: Array<Uint8Array> = [
		new Uint8Array([ 4, 6 ]),
		new Uint8Array([ 7, 5 ]),
    ];

	 static pawnAttacksWhite: Array<Uint32Array>;
	 static pawnAttacksBlack: Array<Uint32Array>;
	 static directionLookup: Uint32Array;

	 static kingAttackBitboards: BigUint64Array;
	 static knightAttackBitboards: BigUint64Array;
	 static pawnAttackBitboards: Array<BigUint64Array>;

	 static rookMoves: BigUint64Array;
	 static bishopMoves: BigUint64Array;
	 static queenMoves: BigUint64Array;

	// Aka manhattan distance (answers how many moves for a rook to get from square a to square b)
	 static orthogonalDistance: Array<Uint32Array>;
	// Aka chebyshev distance (answers how many moves for a king to get from square a to square b)
	 static kingDistance: Array<Uint32Array>;
	 static centreManhattanDistance: Uint32Array;

	 static NumRookMovesToReachSquare (startSquare: number, targetSquare: number) {
		return PrecomputedMoveData.orthogonalDistance[startSquare][targetSquare];
	}

	 static NumKingMovesToReachSquare (startSquare: number, targetSquare: number) {
		return PrecomputedMoveData.kingDistance[startSquare][targetSquare];
	}
    static concatTypedArrays(a: Uint8Array, b: Uint8Array) { // a, b TypedArray of same type
        const c = new Uint8Array(a.length + b.length);
        c.set(a, 0);
        c.set(b, a.length);
        return c;
    }

	// Initialize lookup data
	private static _initialize = (() => {
		PrecomputedMoveData.pawnAttacksWhite = new Array(64);
		PrecomputedMoveData.pawnAttacksBlack = new Array(63);
		PrecomputedMoveData.numSquaresToEdge = new Array(8);
		PrecomputedMoveData.knightMoves = new Array(64);
		PrecomputedMoveData.kingMoves = new Array(64);
		PrecomputedMoveData.numSquaresToEdge = new Array(64);

		PrecomputedMoveData.rookMoves = new BigUint64Array(64);
		PrecomputedMoveData.bishopMoves = new BigUint64Array(64);
		PrecomputedMoveData.queenMoves = new BigUint64Array(64);

		// Calculate knight jumps and available squares for each square on the board.
		// See comments by variable definitions for more info.
		const allKnightJumps: Array<number> = [ 15, 17, -17, -15, 10, -6, 6, -10 ];
		PrecomputedMoveData.knightAttackBitboards = new BigUint64Array(64);
		PrecomputedMoveData.kingAttackBitboards = new BigUint64Array(64);
		PrecomputedMoveData.pawnAttackBitboards = new Array(64);

		for (let squareIndex = 0; squareIndex < 64; squareIndex++) {

			const y = squareIndex / 8;
			const x = squareIndex - y * 8;

			const north = 7 - y;
			const south = y;
			const west = x;
			const east = 7 - x;
			PrecomputedMoveData.numSquaresToEdge[squareIndex] = new Uint32Array(8);
			PrecomputedMoveData.numSquaresToEdge[squareIndex][0] = north;
			PrecomputedMoveData.numSquaresToEdge[squareIndex][1] = south;
			PrecomputedMoveData.numSquaresToEdge[squareIndex][2] = west;
			PrecomputedMoveData.numSquaresToEdge[squareIndex][3] = east;
			PrecomputedMoveData.numSquaresToEdge[squareIndex][4] = Math.min (north, west);
			PrecomputedMoveData.numSquaresToEdge[squareIndex][5] = Math.min (south, east);
			PrecomputedMoveData.numSquaresToEdge[squareIndex][6] = Math.min (north, east);
			PrecomputedMoveData.numSquaresToEdge[squareIndex][7] = Math.min (south, west);

			// Calculate all squares knight can jump to from current square
			let legalKnightJumps = new Uint8Array();
			let knightBitboard: bigint = BigInt(0);
			for (const knightJumpDelta of allKnightJumps) {
				const knightJumpSquare = squareIndex + knightJumpDelta;
				if (knightJumpSquare >= 0 && knightJumpSquare < 64) {
					const knightSquareY = knightJumpSquare / 8;
					const knightSquareX = knightJumpSquare - knightSquareY * 8;
					// Ensure knight has moved max of 2 squares on x/y axis (to reject indices that have wrapped around side of board)
					const maxCoordMoveDst = Math.max (Math.abs (x - knightSquareX), Math.abs (y - knightSquareY));
					if (maxCoordMoveDst == 2) {
						legalKnightJumps = PrecomputedMoveData.concatTypedArrays(legalKnightJumps, new Uint8Array([knightJumpSquare]));
						knightBitboard |= BigInt(1) << BigInt(knightJumpSquare);
					}
				}
			}
			
			
			const knightMovesCurrentSquare: Uint8Array = new Uint8Array(legalKnightJumps.length);
			for(let i = 0; i < legalKnightJumps.length; i++) {
				knightMovesCurrentSquare[i] = legalKnightJumps[i];
			}
			PrecomputedMoveData.knightMoves[squareIndex] = knightMovesCurrentSquare;
			PrecomputedMoveData.knightAttackBitboards[squareIndex] = knightBitboard;

			// Calculate all squares king can move to from current square (not including castling)
			let legalKingMoves = new Uint8Array();
			for (const kingMoveDelta of PrecomputedMoveData.directionOffsets) {
				const kingMoveSquare = squareIndex + kingMoveDelta;
				if (kingMoveSquare >= 0 && kingMoveSquare < 64) {
					const kingSquareY = kingMoveSquare / 8;
					const kingSquareX = kingMoveSquare - kingSquareY * 8;
					// Ensure king has moved max of 1 square on x/y axis (to reject indices that have wrapped around side of board)
					const maxCoordMoveDst = Math.max (Math.abs (x - kingSquareX), Math.abs (y - kingSquareY));
					if (maxCoordMoveDst == 1) {
						legalKingMoves = PrecomputedMoveData.concatTypedArrays(legalKingMoves,  new Uint8Array([ kingMoveSquare]));
						PrecomputedMoveData.kingAttackBitboards[squareIndex] |= BigInt(1) << BigInt(kingMoveSquare);
					}
				}
			}
			const kingMovesCurrentSquare = new Uint8Array(legalKingMoves.length);
			for(let i = 0; i < legalKingMoves.length; i++) {
				kingMovesCurrentSquare[i] = legalKingMoves[i];
			}
			PrecomputedMoveData.kingMoves[squareIndex] = kingMovesCurrentSquare;
			// Calculate legal pawn captures for white and black
			const pawnCapturesWhite: Array<number> = [];
			const pawnCapturesBlack: Array<number> = [];
			PrecomputedMoveData.pawnAttackBitboards[squareIndex] = new BigUint64Array(2);
			if (x > 0) {
				if (y < 7) {
					pawnCapturesWhite.push (squareIndex + 7);
					PrecomputedMoveData.pawnAttackBitboards[squareIndex][BitBoard.whiteIndex] |= BigInt(1) <<  BigInt(squareIndex + 7);
				}
				if (y > 0) {
					pawnCapturesBlack.push (squareIndex - 9);
					PrecomputedMoveData.pawnAttackBitboards[squareIndex][BitBoard.blackIndex] |= BigInt(1) << BigInt(squareIndex - 9);
				}
			}
			if (x < 7) {
				if (y < 7) {
					pawnCapturesWhite.push (squareIndex + 9);
					PrecomputedMoveData.pawnAttackBitboards[squareIndex][BitBoard.whiteIndex] |= BigInt(1) << BigInt(squareIndex + 9);
				}
				if (y > 0) {
					pawnCapturesBlack.push (squareIndex - 7);
					PrecomputedMoveData.pawnAttackBitboards[squareIndex][BitBoard.blackIndex] |= BigInt(1) << BigInt(squareIndex - 7);
				}
			}
			PrecomputedMoveData.pawnAttacksWhite[squareIndex] = new Uint32Array(pawnCapturesWhite);
			PrecomputedMoveData.pawnAttacksBlack[squareIndex] = new Uint32Array(pawnCapturesBlack);

			// Rook moves
			for (let directionIndex = 0; directionIndex < 4; directionIndex++) {
				const currentDirOffset = PrecomputedMoveData.directionOffsets[directionIndex];
				for (let n = 0; n < PrecomputedMoveData.numSquaresToEdge[squareIndex][directionIndex]; n++) {
					const targetSquare = squareIndex + currentDirOffset * (n + 1);
					PrecomputedMoveData.rookMoves[squareIndex] |= BigInt(1) << BigInt(targetSquare);
				}
			}
			// Bishop moves
			for (let directionIndex = 4; directionIndex < 8; directionIndex++) {
				const currentDirOffset = PrecomputedMoveData.directionOffsets[directionIndex];
				for (let n = 0; n < PrecomputedMoveData.numSquaresToEdge[squareIndex][directionIndex]; n++) {
				    const targetSquare = squareIndex + currentDirOffset * (n + 1);
					PrecomputedMoveData.bishopMoves[squareIndex] |= BigInt(1) << BigInt(targetSquare);
				}
			}
			PrecomputedMoveData.queenMoves[squareIndex] = PrecomputedMoveData.rookMoves[squareIndex] | PrecomputedMoveData.bishopMoves[squareIndex];
		}

		PrecomputedMoveData.directionLookup = new Uint32Array([127]);
		for (let i = 0; i < 127; i++) {
			const offset = i - 63;
			const absOffset = Math.abs (offset);
			let absDir = 1;
			if (absOffset % 9 == 0) {
				absDir = 9;
			} else if (absOffset % 8 == 0) {
				absDir = 8;
			} else if (absOffset % 7 == 0) {
				absDir = 7;
			}

			PrecomputedMoveData.directionLookup[i] = absDir * Math.sign(offset);
		}

		// Distance lookup
        PrecomputedMoveData.orthogonalDistance = Array(64).fill(new Uint32Array(64));
		PrecomputedMoveData.kingDistance = Array(64).fill(new Uint32Array(64));
		PrecomputedMoveData.centreManhattanDistance = new Uint32Array(64);
		for (let squareA = 0; squareA < 64; squareA++) {
			const coordA: Coord = BoardRepresentation.coordFromIndex(squareA);
			const fileDstFromCentre = Math.max(3 - coordA.fileIndex, coordA.fileIndex - 4);
			const rankDstFromCentre = Math.max(3 - coordA.rankIndex, coordA.rankIndex - 4);
			PrecomputedMoveData.centreManhattanDistance[squareA] = fileDstFromCentre + rankDstFromCentre;

			for (let squareB = 0; squareB < 64; squareB++) {

				const coordB: Coord = BoardRepresentation.coordFromIndex(squareB);
				const rankDistance = Math.abs (coordA.rankIndex - coordB.rankIndex);
				const fileDistance = Math.abs (coordA.fileIndex - coordB.fileIndex);
				PrecomputedMoveData.orthogonalDistance[squareA][squareB] = fileDistance + rankDistance;
				PrecomputedMoveData.kingDistance[squareA][squareB] = Math.max(fileDistance, rankDistance);
			}
		}
	}
)};
