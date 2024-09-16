import BitBoard from "@/app/utils/board/bitboard/bitboards";
import BoardRepresentation from "@/app/utils/board/bitboard/board-representation";
import Move, {Flag} from "@/app/utils/board/bitboard/move";
import Piece from "@/app/utils/board/bitboard/piece";
import { startFen } from "@/app/utils/board/fen";

describe("BitBoard", () => {

    it("works", () => {
        const board = new BitBoard(startFen);
        expect(board.squares).toBeDefined();
    })
    

    test("makeMove", () => {
        const board = new BitBoard(startFen);
        const startSquare = BoardRepresentation.squareStartToIndex({x: 3, y: 2, piece: 0}) //c2
        const targetSquare = BoardRepresentation.squareStartToIndex({x: 3, y: 4, piece: 0}) //c4
        // console.log(board);
        // console.log(board.squares);
        expect(board).toBeDefined()
        expect(board.getSquare(startSquare)).toBe(Piece.pawn + Piece.white);
        expect(board.getSquare(targetSquare)).toBe(Piece.none);
        const move = new Move(startSquare, targetSquare, Flag.pawnTwoForward);
        board.makeMove(move);
        expect(board.getSquare(targetSquare)).toBe(Piece.pawn + Piece.white);
        expect(board.getSquare(startSquare)).toBe(Piece.none);

    })

    test("unMakeMove", () => {
        const board = new BitBoard(startFen);
        const startSquare = BoardRepresentation.squareStartToIndex({x: 3, y: 2, piece: 0}) //c2
        const targetSquare = BoardRepresentation.squareStartToIndex({x: 3, y: 4, piece: 0}) //c4
        // console.log(board);
        // console.log(board.squares);
        expect(board).toBeDefined()
        expect(board.getSquare(startSquare)).toBe(Piece.pawn + Piece.white);
        expect(board.getSquare(targetSquare)).toBe(Piece.none);
        const move = new Move(startSquare, targetSquare, Flag.pawnTwoForward);
        board.makeMove(move);
        expect(board.getSquare(targetSquare)).toBe(Piece.pawn + Piece.white);
        expect(board.getSquare(startSquare)).toBe(Piece.none);
        board.unmakeMove(move);
        expect(board.getSquare(startSquare)).toBe(Piece.pawn + Piece.white);
        expect(board.getSquare(targetSquare)).toBe(Piece.none);
    })

})
