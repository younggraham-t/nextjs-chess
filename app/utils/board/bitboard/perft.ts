import MoveGenerator from "@/app/utils/board/bitboard/move-generator";
import BitBoard from "@/app/utils/board/bitboard/bitboards";
import Move from "./move";

export default class Perft {
    board: BitBoard;
    static moveGenerator: MoveGenerator = new MoveGenerator();
    initialDepth: number = 0;
    initialDepthMoves: Array<string> = [];
    initialPositionFen: string;

    constructor(fen: string) {
        this.board = new BitBoard(fen);
        this.initialPositionFen = fen;
    }

    public reset() {
        this.board = new BitBoard(this.initialPositionFen);
        this.initialDepth = 0;
        this.initialDepthMoves = [];
    }
    public runPerft(initialDepth: number) {
        this.reset();
        this.initialDepth = initialDepth
        const nodes = this.perft(initialDepth);
        console.log(this.initialDepthMoves.sort())
        return nodes;
    }

    private perft(depth: number): bigint {
    // console.log(board)
    const moveList: Array<Move> = [];
    Perft.moveGenerator.generateMoves(this.board, moveList);
    // console.log(MoveGenerator.returnMoves(moveList));
    let nodes = BigInt(0);
    if (depth == 1) {
        if (depth == this.initialDepth) {
            for (const move of moveList) {

                this.initialDepthMoves.push(`${Move.toString(move)}: ${1}`);
        
            }
        }
        // console.log(moveList.length)
        return BigInt(moveList.length);
    }

    for (const move of moveList) {
        this.board.makeMove(move, true);
        // console.log(Move.toString(move));
        const curNodes = this.perft(depth - 1);
        nodes += curNodes;
        if (depth == this.initialDepth) this.initialDepthMoves.push(`${Move.toString(move)}: ${curNodes}`);
        this.board.unmakeMove(move, true);
        
    }
    
    // console.log(nodes);
    return nodes;

}
}


