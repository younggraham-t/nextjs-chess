import BitBoard from "@/app/utils/board/bitboard/bitboards";
import {useBoardContext} from "./board-context";
import Move from "@/app/utils/board/bitboard/move";
import MoveGenerator from "@/app/utils/board/bitboard/move-generator";


export default function Pgn() {
    const boardContext = useBoardContext();

    const fullMoves = new Array<JSX.Element>();
    let currentFullMove = boardContext.previousPositions[0].fullMove;
    let currentChildren = new Array<JSX.Element>();

    for (let i = 0; i < boardContext.previousPositions.length; i++) {
        const position = boardContext.previousPositions[i];
        if (position.lastMoveIds.length === 2) {
            const moveGenerator = new MoveGenerator();
            // console.log(position)
            const moveName = Move.toAlgebraicString(position.lastMove, new BitBoard(position.previousFen), moveGenerator);
            let className = "text-foreground"
            if (i == boardContext.currentPositionIndex) {
                className = "text-yellow-500";
            }
            currentChildren.push(<p key={i} className={`${className} w-10 ml-4`}>{moveName}</p>)

            if (position.fullMove != currentFullMove || i == boardContext.previousPositions.length - 1) {
                fullMoves.push(
                    <div className={`flex`}>
                        <p className={`w-2 mr-3`}>{currentFullMove}.</p>
                        {currentChildren}
                    </div>
                )
                currentFullMove = position.fullMove;
                currentChildren = new Array<JSX.Element>();
            }
        }

    }

    return (
        <>
            {fullMoves}
        </>
    )

}
