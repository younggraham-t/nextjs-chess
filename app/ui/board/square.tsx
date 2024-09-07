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


export type Ref = {
    setHover: Dispatch<SetStateAction<boolean>>,
    setPiece: Dispatch<SetStateAction<string | undefined>>,
    setLegalMove: Dispatch<SetStateAction<boolean>>,

};

export default forwardRef<Ref, SquareProps>(function Square(props: SquareProps, ref) {
    const [ highlight, setHighlight ] = useState<boolean>(false);
    const [ hover, setHover ] = useState<boolean>(false);
    const [ piece, setPiece ] = useState<string | undefined>(props.piece);
    const [ isLegalMove, setLegalMove ] = useState<boolean>(false);
    const { positionX, positionY } = props;

    useImperativeHandle(ref, () => ({
        setHover,
        setPiece,
        setLegalMove
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
            ref={ref}
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
