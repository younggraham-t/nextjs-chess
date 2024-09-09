"use client";
import {useState, useEffect, SetStateAction, Dispatch, useRef} from "react";
import {Position, SquareStart} from "@/app/utils/board/posistions";
import Square, { SquareRef } from "./square";
import {useRefs} from "@/app/utils/use-refs";
import {removeHighlights, removeLegalMoves, moveStringToMove, getSquares} from "@/app/utils/board/board-utils";
import {GameColor} from "@/app/page";
import {positionToFen} from "@/app/utils/board/fen";
import BitBoard from "@/app/utils/board/bitboard/bitboards";


export type HandleSquareClickedProps = {
    id: string,
    positionX: number,
    positionY: number,
    piece?: string,
    isLegalMove: boolean,
    setPiece: Dispatch<SetStateAction<string | undefined>>,
    setHover: Dispatch<SetStateAction<boolean>>,

}

export default function BoardLayout(props: {position: Position}) {
    const validMoves = ["e2e4", "e2e3", "d2d3", "d2d4"]
    const {refsByKey, setRef} = useRefs();
    const [ curPiece, setCurPiece ] = useState<HandleSquareClickedProps | null>(null);
    const [ position, setPosition ] = useState<Position>(props.position);

    useEffect(() => { 
        const board = new BitBoard(positionToFen(position));
    }, [position]);

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
        removeHighlights(refsByKey);
        removeLegalMoves(refsByKey);
        
        // check if the piece is a piece of the player's
        // if (clickedSquare.piece.charAt(0) !== props.player.color) return
        // check if it is the player's turn

        // console.log(clickedSquare.isLegalMove)
        //check if clickedSquare is a legal move and make that move
        if (clickedSquare.isLegalMove) {
            handleMakeMove(clickedSquare);
        }

        // check if the clicked square has a piece
        if (!clickedSquare.piece) return
        //set curPiece for future checks
        setCurPiece(clickedSquare);

        // set hover on clicked square
        clickedSquare.setHover(true);

        // display valid moves from clicked square
        for (const move of validMoves) {
           const {from, to} = moveStringToMove(move);
           if (from.x === clickedSquare.positionX && from.y === clickedSquare.positionY) {
               const toId = `${to.x}${to.y}`;
               // console.log(toId)
               refsByKey[toId]?.setLegalMove(true);
                             
           }

        }
    
    }
    const handleMakeMove = (clickedSquare: HandleSquareClickedProps) => {
        if (curPiece && curPiece.piece) {
            //put curPiece on new square
            if (refsByKey[clickedSquare.id]) {
                const clickedSquareRef = refsByKey[clickedSquare.id];
                clickedSquareRef?.handleSetPiece(curPiece.piece, clickedSquareRef)
            }
            //remove curPiece from old square
            if (refsByKey[curPiece.id]) {
                const curPieceRef = refsByKey[curPiece.id];
                curPieceRef?.handleSetPiece(undefined, curPieceRef);
            }
            //handle any capturing
            //set curPiece to null
            setCurPiece(null);
            removeHighlights(refsByKey);
            removeLegalMoves(refsByKey);
            handleSetPosition(refsByKey);

            
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
