"use client";
import {useState, useEffect, SetStateAction, Dispatch, Ref, useRef} from "react";
import {startPos} from "./start-pos";
import Square, {  } from "./square";
import {useRefs} from "@/app/utils/use-refs";


export type HandleSquareClickedProps = {
    id: string,
    positionX: number,
    positionY: number,
    piece?: string,
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

export default function BoardLayout(props: {player: Player}) {
    const validMoves = ["e2e4", "e2e3", "d2d3", "d2d4"]


    const {refsByKey, setRef} = useRefs();

    function moveStringToMove(move: string) {
        const fromStr = move.slice(0,2);
        console.log(fromStr);
        const toStr = move.slice(1);
        console.log(toStr);
        const letterToNumber = new Map<string, number>();
        letterToNumber.set("a", 1);
        letterToNumber.set("b", 2);
        letterToNumber.set("c", 3);
        letterToNumber.set("d", 4);
        letterToNumber.set("e", 5);
        letterToNumber.set("f", 6);
        letterToNumber.set("g", 7);
        letterToNumber.set("h", 8);
        const from = {
            x: letterToNumber.get(fromStr.slice(0,1)),
            y: parseInt(fromStr.slice(1)),
        }
        const to = {
            x: letterToNumber.get(toStr.slice(0,1)),
            y: parseInt(toStr.slice(1)),
        }
        return {from, to}
        
    }
    const handleSquareClicked = (clickedSquare: HandleSquareClickedProps) => {
        console.log(clickedSquare.piece ? clickedSquare.piece : `${clickedSquare.positionX}${clickedSquare.positionY}`);
        // check if the clicked square has a piece
        if (!clickedSquare.piece) return
        // check if the piece is a piece of the player's
        // if (clickedSquare.piece.charAt(0) !== props.player.color) return
        // check if it is the player's turn

        // set hover on clicked square
        clickedSquare.setHover(true);
        for (const [key, value] of Object.entries(refsByKey)) {
            if (clickedSquare.id !== key) {
               if (value) value.setHover(false);
            }
        }
        // display valid moves from clicked square
        for (const move in validMoves) {
           const {from, to} = moveStringToMove(move);
           if (from.x === clickedSquare.positionX && from.y === clickedSquare.positionY) {
               
           }

        }
    
    }
    const squares = startPos.map((square) => {
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
