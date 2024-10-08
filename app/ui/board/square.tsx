"use client";
import { MouseEvent, SetStateAction, Dispatch, useState, forwardRef, useImperativeHandle } from "react";
import { xTranslations, yTranslations, pieceTypes } from "./square-tw-classes";
import clsx from "clsx";
import Piece from "@/app/utils/board/bitboard/piece";

export type SquareProps = {
    id: string,
    piece: number,
    positionX: number,
    positionY: number,
    handleSquareClicked: (squareClicedId: string, moveFlag: number | undefined, shiftOrCtrl: boolean | undefined) => void,
}


export type SquareRef = {
    setHover: Dispatch<SetStateAction<boolean>>,
    handleSetPiece: (piece: number, ref: SquareRef) => void,
    setLegalMove: Dispatch<SetStateAction<boolean>>,
    setMoveFlag: Dispatch<SetStateAction<number | undefined>>,
    piece: number,
    id: string,
    isLegalMove: boolean,
    moveFlag: number | undefined,

};

export default forwardRef<SquareRef, SquareProps>(function Square(props: SquareProps, ref) {
    const [ highlight, setHighlight ] = useState<boolean>(false);
    const [ hover, setHover ] = useState<boolean>(false);
    const [ piece, setPiece ] = useState<number>(props.piece);
    const [ isLegalMove, setLegalMove ] = useState<boolean>(false);
    const [ moveFlag, setMoveFlag ] = useState<number>();
    const { positionX, positionY } = props;


    const handleSetPiece = (piece: number, ref: SquareRef) => {
        setPiece(piece);
        ref.piece = piece;
    }

    useImperativeHandle(ref, () => ({
        setHover,
        handleSetPiece,
        setLegalMove,
        setMoveFlag,
        piece,
        id: props.id,
        isLegalMove,
        moveFlag,
    }));

    const handleRightClickEvent = (e: MouseEvent<HTMLDivElement>) => {
        console.log(`square ${positionX}, ${positionY} right click`);
        setHighlight(!highlight);
        e.preventDefault();
    };

    const handleLeftClickEvent = async (e: MouseEvent<HTMLDivElement>) => {
        // console.log(`square ${positionX}, ${positionY} left click`);

        
        props.handleSquareClicked(props.id, moveFlag, e.ctrlKey || e.shiftKey);
        e.preventDefault();
    };


    const pieceClass = pieceTypes.get(Piece.toString(piece));
    let className = pieceClass + " ";
    className += xTranslations.get(positionX) + " ";
    className += yTranslations.get(positionY);

    return (
        <>
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
                isLegalMove && piece === Piece.none && 
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="20" fill="#262626" opacity="0.5"/>
                </svg>
                }
                {
                isLegalMove && piece != Piece.none &&
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#111827" strokeWidth="5" opacity="0.5"/>
                </svg>
                }
            </div>
        </>
    )
})
