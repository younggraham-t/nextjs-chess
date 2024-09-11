"use client";
import {useState, useEffect, SetStateAction, Dispatch, useRef} from "react";
import {Position, SquareStart} from "@/app/utils/board/posistions";
import Square, { SquareRef } from "./square";
import {useRefs} from "@/app/utils/use-refs";
import {removeHighlights, removeLegalMoves, moveStringToMove, getSquares, squareIdToString} from "@/app/utils/board/board-utils";
import {GameColor} from "@/app/page";
import {positionToFen} from "@/app/utils/board/fen";
import BitBoard from "@/app/utils/board/bitboard/bitboards";
import MoveGenerator from "@/app/utils/board/bitboard/move-generator";
import Move, {Flag} from "@/app/utils/board/bitboard/move";
import BoardRepresentation from "@/app/utils/board/bitboard/board-representation";


export type HandleSquareClickedProps = {
    id: string,
    positionX: number,
    positionY: number,
    piece?: string,
    isLegalMove: boolean,
    setPiece: Dispatch<SetStateAction<string | undefined>>,
    setHover: Dispatch<SetStateAction<boolean>>,
    moveFlag: number | undefined,

}

export type LastMoveRefs = {
    lastMoveStart: SquareRef,
    lastMoveEnd: SquareRef,
}

export default function BoardLayout(props: {position: Position}) {
    const [ validMoves, setValidMoves ] = useState<Array<Move>>([]); 
    const {refsByKey, setRef} = useRefs();
    const [ curPiece, setCurPiece ] = useState<HandleSquareClickedProps | null>(null);
    const [ position, setPosition ] = useState<Position>(props.position);
    const [ lastMove, setLastMove ] = useState<LastMoveRefs>();
    const [ enpassantPawn, setEnpassantPawn ] = useState<SquareRef | null>(null);

    useEffect(() => { 
        const board = new BitBoard(positionToFen(position));
        const moveGenerator = new MoveGenerator(board);
        const moves = moveGenerator.generateMoves();
        console.log(moves);
        console.log(position);
        setValidMoves(moves);
        removeHighlights(refsByKey, lastMove);
    }, [position, lastMove, refsByKey]);

    const handleSetPosition = (squareRefs?: Record<string, SquareRef | null>, 
                            activeColor?: GameColor, 
                            castling?: string, 
                            enPassant?: string, 
                            halfMove?: number, 
                            fullMove?: number ) => {
        let updateSquares: Array<SquareStart>;
        if (squareRefs) {
            updateSquares = getSquares(squareRefs);
            // console.log(updateSquares);
        }
        else {
            updateSquares = position.squares;
        }
        const updateActiveColor = activeColor?? position.activeColor;
        const updateCastling = castling?? position.castling;
        const updateEnPassant = enPassant?? position.enPassant;
        const updateHalfMove = halfMove?? position.halfMove;
        const updateFullMove = fullMove?? position.fullMove;

        const newPosition: Position = {
            squares: updateSquares,
            activeColor: updateActiveColor,
            castling: updateCastling,
            enPassant: updateEnPassant,
            halfMove: updateHalfMove,
            fullMove: updateFullMove,
        }
        // console.log(newPosition);
        setPosition(newPosition);
    }

    const handleSquareClicked = (clickedSquare: HandleSquareClickedProps) => {
        console.log(clickedSquare.piece ? clickedSquare.piece : `${clickedSquare.positionX}${clickedSquare.positionY}`);
        
        //remove highlights and legal move highlights
        removeLegalMoves(refsByKey);
        removeHighlights(refsByKey, lastMove) 
        // check if the piece is a piece of the player's
        // if (clickedSquare.piece.charAt(0) !== props.player.color) return
        // check if it is the player's turn

        // console.log(clickedSquare.isLegalMove)
        //check if clickedSquare is a legal move and make that move
        if (clickedSquare.isLegalMove) {
            handleMakeMove(clickedSquare);
            return;
        }

        // check if the clicked square has a piece
        if (!clickedSquare.piece) return
        const curPieceColor = clickedSquare.piece?.charAt(0).toLowerCase() === "w" ? GameColor.white : GameColor.black
        //set curPiece for future checks
        setCurPiece(clickedSquare);

        // set hover on clicked square

        if (curPieceColor === position.activeColor) clickedSquare.setHover(true);

        // display valid moves from clicked square
        for (const move of validMoves) {
               const from = BoardRepresentation.indexToSquareStart(move.getStartSquare());
               const to = BoardRepresentation.indexToSquareStart(move.getTargetSquare());
               const flag = move.getMoveFlag();
               if (from.x === clickedSquare.positionX && from.y === clickedSquare.positionY) {
                   const toId = `${to.x}${to.y}`;
                   // console.log(toId)
                   refsByKey[toId]?.setLegalMove(true);
                   if (flag > 2 && flag < 7) {
                       refsByKey[toId]?.setMoveFlag(3);
                   }
                   else {

                      refsByKey[toId]?.setMoveFlag(flag);
                   }

                   console.log(from)
                    console.log(toId); 
               }

        }
    
    }
    const handleMakeMove = (clickedSquare: HandleSquareClickedProps) => {
        let newLastMove: LastMoveRefs;
        if (curPiece && curPiece.piece) {
            const curPieceRef = refsByKey[curPiece.id];
            const clickedSquareRef = refsByKey[clickedSquare.id];
            let curPiecePiece = curPiece.piece;
            const curPieceColor = curPiecePiece.slice(0,1);

            let castling = position.castling;
            let enPassant = "";
            let halfMove = position.halfMove;
            //handle move flags
            if (clickedSquare.moveFlag) {
                switch (clickedSquare.moveFlag) {
                    case Flag.pawnTwoForward: 
                        const epOffset = position.activeColor === GameColor.white ? -1 : 1
                        enPassant = squareIdToString(clickedSquare.positionX, clickedSquare.positionY + epOffset);
                        setEnpassantPawn(refsByKey[clickedSquare.id]);
                        break; 
                    case Flag.enPassantCapture:
                        if (enpassantPawn) {
                            enpassantPawn.handleSetPiece(undefined, enpassantPawn);
                            setEnpassantPawn(null);
                        }
                        break;
                    case Flag.castling:
                        break;
                    case Flag.promoteToQueen:
                        console.log(curPiece.piece)
                        curPiecePiece = curPieceColor + "q"
                        console.log(curPiecePiece)
                        break;
                    case Flag.promoteToRook:
                        break;
                    case Flag.promoteToKnight:
                        break;
                    case Flag.promoteToBishop:
                        break;
                }
            }
            let lastMoveStart: SquareRef;
            let lastMoveEnd: SquareRef;
            //put curPiece on new square
            if (clickedSquareRef) {
                clickedSquareRef.handleSetPiece(curPiecePiece, clickedSquareRef)
                lastMoveStart = clickedSquareRef;
            }
            //remove curPiece from old square
            if (curPieceRef) {
                curPieceRef.handleSetPiece(undefined, curPieceRef);
                lastMoveEnd = curPieceRef;
            }

            if (lastMoveStart && lastMoveEnd) {
                // console.log(lastMoveEnd)
                newLastMove = {lastMoveStart, lastMoveEnd}
                setLastMove(newLastMove);
                // console.log(lastMove);
            }
            //set curPiece to null
            setCurPiece(null);
            removeLegalMoves(refsByKey);
            const newActiveColor = position.activeColor === GameColor.white ? GameColor.black : GameColor.white;
            const newFullMove = newActiveColor === GameColor.white ? position.fullMove + 1 : position.fullMove;
            handleSetPosition(refsByKey, newActiveColor, castling, enPassant, halfMove, newFullMove );

            
        }
    }
    
    const squares = props.position.squares.map((square) => {
        const id = `${square.x}${square.y}`;
        return (
            <Square 
            key={id} 
            id={id} 
            positionX={square.x} 
            positionY={square.y} 
            piece={square.piece} 
            handleSquareClicked={handleSquareClicked} 
            ref={element => setRef(element, id)}

            />
           )
    })
    return (
        <div className={`flex m-12 h-[480px] w-[480px] bg-board bg-cover relative`}>
            {squares}
		</div>
    )
}
