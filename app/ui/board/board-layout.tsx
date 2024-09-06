"use client";
import {SetStateAction, Dispatch} from "react";
import Square from "./square"

export type HandleSquareClickedProps = {
    positionX: number,
    positionY: number,
    piece?: string,
    setHover: Dispatch<SetStateAction<boolean>>,

}
export default function BoardLayout() {
    const handleSquareClicked = (clickedSquare: HandleSquareClickedProps) => {
        console.log(clickedSquare.piece ? clickedSquare.piece : clickedSquare.positionX);
    }
    return (
        <div className={`flex m-12 h-[480px] w-[480px] bg-board bg-cover`}>
            <Square positionX={2} positionY={3} piece={"wp"} handleSquareClicked={handleSquareClicked}/>
            <Square positionX={5} positionY={7} piece={"bk"} handleSquareClicked={handleSquareClicked}/>
		</div>
    )
}
