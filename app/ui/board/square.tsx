"use client";
import { MouseEvent, useState } from "react";
import { xTranslations, yTranslations, pieceTypes } from "./square-tw-classes";
import clsx from "clsx";
import {HandleSquareClickedProps} from "./board-layout";

export type SquareProps = {
    lastMove?: boolean,
    piece?: string,
    positionX: number,
    positionY: number,
    handleSquareClicked: (squareClicked: HandleSquareClickedProps) => void,
}

export default function Square(props: SquareProps) {
    const [ highlight, setHighlight ] = useState<boolean>(false);
    const [ hover, setHover ] = useState<boolean>(false);
    const { lastMove, piece, positionX, positionY } = props;

    const handleRightClickEvent = (e: MouseEvent<HTMLDivElement>) => {
        console.log(`square ${positionX}, ${positionY} right click`);
        setHighlight(!highlight);
        e.preventDefault();
    };

    const handleLeftClickEvent = (e: MouseEvent<HTMLDivElement>) => {
        console.log(`square ${positionX}, ${positionY} left click`);
        props.handleSquareClicked({
            positionX: positionX,
            positionY: positionY,
            piece: piece,
            setHover: setHover,
        });
        e.preventDefault();
    };


    let className = piece ? pieceTypes.get(piece) + " " : "";
    className += xTranslations.get(positionX) + " ";
    className += yTranslations.get(positionY);

    return (
        <div className={clsx(
            `w-[12.5%] h-[12.5%] bg-cover transform ${className}`,
                    {
                         "bg-lime-400": lastMove,
                         "bg-red-500": highlight,
                         "bg-lime-300": hover,
                    }
            )}
            onClick={handleLeftClickEvent} 
            onContextMenu={handleRightClickEvent}>
        </div>
    )
}
