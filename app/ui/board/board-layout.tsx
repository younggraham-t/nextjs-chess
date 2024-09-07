"use client";
import {useState, useEffect, SetStateAction, Dispatch, Ref, useRef} from "react";
import {SquareStart} from "@/app/utils/board/posistions";
import Square, {  } from "./square";
import {useRefs} from "@/app/utils/use-refs";
import {removeHighlights, removeLegalMoves, moveStringToMove} from "@/app/utils/board/board-utils";


export type HandleSquareClickedProps = {
    id: string,
    positionX: number,
    positionY: number,
    piece?: string,
    isLegalMove: boolean,
    setPiece: Dispatch<SetStateAction<string | undefined>>,
    setHover: Dispatch<SetStateAction<boolean>>,

}

export enum GameColor {
    white = "w",
    black = "b",
}
export type Player = {
    color: GameColor,
}

export default function BoardLayout(props: {position: Array<SquareStart>}) {
    const validMoves = ["e2e4", "e2e3", "d2d3", "d2d4"]
    const {position, player} = props;
    const {refsByKey, setRef} = useRefs();
    const [ curPiece, setCurPiece ] = useState<HandleSquareClickedProps | null>(null);

    const handleSquareClicked = (clickedSquare: HandleSquareClickedProps) => {
        console.log(clickedSquare.piece ? clickedSquare.piece : `${clickedSquare.positionX}${clickedSquare.positionY}`);
        // check if the piece is a piece of the player's
        // if (clickedSquare.piece.charAt(0) !== props.player.color) return
        // check if it is the player's turn

        // console.log(clickedSquare.isLegalMove)
        //check if clickedSquare is a validMove
        if (clickedSquare.isLegalMove) {
            if (curPiece && curPiece.piece) {
                //put curPiece on new square
                clickedSquare.setPiece(curPiece.piece)
                //remove curPiece from old square
                curPiece.setPiece(undefined);
                //handle any capturing
                //set curPiece to null
                setCurPiece(null);
                removeHighlights(refsByKey);
                removeLegalMoves(refsByKey);
                
            }

        }

        // check if the clicked square has a piece
        if (!clickedSquare.piece) return
        //set curPiece for future checks
        setCurPiece(clickedSquare);

        // set hover on clicked square
        removeHighlights(refsByKey);
        clickedSquare.setHover(true);

        // display valid moves from clicked square
        removeLegalMoves(refsByKey);
        for (const move of validMoves) {
           const {from, to} = moveStringToMove(move);
           if (from.x === clickedSquare.positionX && from.y === clickedSquare.positionY) {
               const toId = `${to.x}${to.y}`;
               // console.log(toId)
               refsByKey[toId]?.setLegalMove(true);
                             
           }

        }
    
    }
    const squares = position.map((square) => {
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
