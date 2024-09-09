"use client";
import { MouseEvent, SetStateAction, Dispatch, useState, forwardRef, useImperativeHandle } from "react";
import { xTranslations, yTranslations, pieceTypes } from "./square-tw-classes";
import clsx from "clsx";
import {HandleSquareClickedProps} from "./board-layout";

export type SquareProps = {
    id: string,
    piece?: string,
    positionX: number,
    positionY: number,
    handleSquareClicked: (squareClicked: HandleSquareClickedProps) => void,
}


export type SquareRef = {
    setHover: Dispatch<SetStateAction<boolean>>,
    handleSetPiece: (piece: string | undefined, ref: SquareRef) => void,
    setLegalMove: Dispatch<SetStateAction<boolean>>,
    piece?: string,
    id: string,

};

export default forwardRef<SquareRef, SquareProps>(function Square(props: SquareProps, ref) {
    const [ highlight, setHighlight ] = useState<boolean>(false);
    const [ hover, setHover ] = useState<boolean>(false);
    const [ piece, setPiece ] = useState<string | undefined>(props.piece);
    const [ isLegalMove, setLegalMove ] = useState<boolean>(false);
    const { positionX, positionY } = props;

    const handleSetPiece = (piece: string | undefined, ref: SquareRef) => {
        setPiece(piece);
        ref.piece = piece;
    }

    useImperativeHandle(ref, () => ({
        setHover,
        handleSetPiece,
        setLegalMove,
        piece,
        id: props.id,
    }));

    const handleRightClickEvent = (e: MouseEvent<HTMLDivElement>) => {
        console.log(`square ${positionX}, ${positionY} right click`);
        setHighlight(!highlight);
        e.preventDefault();
    };

    const handleLeftClickEvent = (e: MouseEvent<HTMLDivElement>) => {
        // console.log(`square ${positionX}, ${positionY} left click`);
        props.handleSquareClicked({
            id: props.id,
            positionX: positionX,
            positionY: positionY,
            piece: piece,
            isLegalMove: isLegalMove,
            setPiece: setPiece,
            setHover: setHover,
        });
        e.preventDefault();
    };


    let className = piece ? pieceTypes.get(piece) + " " : "";
    className += xTranslations.get(positionX) + " ";
    className += yTranslations.get(positionY);

    return (
        <div className={clsx(
            `w-[12.5%] h-[12.5%] absolute bg-cover transform ${className}`,
                    {
                         "bg-red-500": highlight,
                         "bg-lime-300": hover,
                    }
            )}
            onClick={handleLeftClickEvent} 
            onContextMenu={handleRightClickEvent}
            id={props.id}
        >
            {
			isLegalMove && 
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="25"/>
			</svg>
			}
        </div>
    )
})
