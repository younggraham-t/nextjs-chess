import MoveGenerator from "@/app/utils/board/bitboard/move-generator";
import BitBoard from "@/app/utils/board/bitboard/bitboards";



export function perft(board: BitBoard, depth: number): bigint {
    const moveGenerator = new MoveGenerator(board)
    const moveList = moveGenerator.generateMoves();
    console.log(moveGenerator.returnMoves(moveList));
    let nodes = BigInt(0);
    if (depth == 1) {
        return BigInt(moveList.length);
    }

    for (const move of moveList) {
        board.makeMove(move, true);
        nodes += perft(board, depth - 1);
        // console.log(nodes);
        board.unmakeMove(move, true);
        
    }
    
    // console.log(nodes);
    return nodes;

}

