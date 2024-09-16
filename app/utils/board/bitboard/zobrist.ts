import { randomBytes } from "crypto";
import Queue from "../../queue"; 
import BitBoard from "./bitboards";
import Piece from "./piece";
import { RandomGenerator } from "@japan-d2/random-bigint";

export default class Zobrist {
	static seed = 2361912;
	static randomNumbersFilePath = "/RandomNumbers.txt";

	/// piece type, colour, square index
	public piecesArray: Array<Array<Array<bigint>>>;
	public castlingRights: Array<bigint> = new Array(16);
	/// ep file (0 = no ep).
	public enPassantFile: Array<bigint> = new Array(9); // no need for rank info as side to move is included in key
	public sideToMove: bigint;

    prng = new RandomGenerator({seed: BigInt(Zobrist.seed), limit: BigInt(10) ** BigInt(64)})



	readRandomNumbers() {
		const numRandomNumbers = 64 * 8 * 2 + this.castlingRights.length + 9 + 1;


		const randomNumbers: Queue<bigint> = new Queue();

		for (let i = 0; i < numRandomNumbers; i++) {
			const number = BigInt(this.randomUnsigned64BitNumber());
			randomNumbers.enqueue(number);
		}
		return randomNumbers;
	}

	constructor() {
        this.piecesArray = new Array(8);
		const randomNumbers = this.readRandomNumbers();

		for (let squareIndex = 0; squareIndex < 64; squareIndex++) {
			for (let pieceIndex = 0; pieceIndex < 8; pieceIndex++) {
                if (!this.piecesArray[pieceIndex]) {
                    this.piecesArray[pieceIndex] = [new Array<bigint>(), new Array<bigint>()]
                }
                // console.log(pieceIndex);
                // console.log(this.piecesArray[pieceIndex]);
				this.piecesArray[pieceIndex][BitBoard.whiteIndex][squareIndex] = randomNumbers.dequeue()?? BigInt(0);
				this.piecesArray[pieceIndex][BitBoard.blackIndex][squareIndex] = randomNumbers.dequeue()?? BigInt(0);
			}
		}

		for (let i = 0; i < 16; i++) {
			this.castlingRights[i] = randomNumbers.dequeue()?? BigInt(0);
		}

		for (let i = 0; i < this.enPassantFile.length; i++) {
			this.enPassantFile[i] = randomNumbers.dequeue()?? BigInt(0);
		}

		this.sideToMove = randomNumbers.dequeue()?? BigInt(0);
	}

	/// Calculate zobrist key from current board position. This should only be used after setting board from fen; during search the key should be updated incrementally.
	public static calculateZobristKey(board: BitBoard) {
        const zobrist = new Zobrist();
		let zobristKey = BigInt(0);

		for (let squareIndex = 0; squareIndex < 64; squareIndex++) {
			if (board.squares[squareIndex] != 0) {
				const pieceType = Piece.getPieceType(board.squares[squareIndex]);
				const pieceColor = Piece.getColor(board.squares[squareIndex]);

				zobristKey ^= zobrist.piecesArray[pieceType][(pieceColor == Piece.white) ? BitBoard.whiteIndex : BitBoard.blackIndex][squareIndex];
			}
		}

		const epIndex = (board.currentGameState >> 4) & 15;
		if (epIndex != -1) {
			zobristKey ^= zobrist.enPassantFile[epIndex];
		}

		if (board.activeColor == Piece.black) {
			zobristKey ^= zobrist.sideToMove;
		}

		zobristKey ^= zobrist.castlingRights[board.currentGameState & 0b1111];

		return zobristKey;
	}



	randomUnsigned64BitNumber(): bigint {
        return this.prng.next();
	}
}
