import { xTranslations, pieceTypes } from "./square-tw-classes";
import { MouseEvent } from "react";
import { Flag } from "@/app/utils/board/bitboard/move";

export default function PromotionSelection(props: {x: number, y: number, handleClick: (value: number) => void, handleCancel: () => void}) {

    const {x, y, handleClick} = props;


    let pieces: Array<string | undefined>;
    if (y == 1) {
        pieces = ["bb", "br", "bn", "bq"];

    }
    else {
        pieces = ["wq", "wn", "wr", "wb"];
    }

    const handleLeftClickEvent = ( e: MouseEvent<HTMLDivElement> ) => {
        // console.log(e.currentTarget)
        const elementId = e.currentTarget.getAttribute("id");
        if (elementId) {
            const promotionType = parseInt(elementId);
            // console.log(promotionType);
            handleClick(promotionType);
            e.preventDefault();
        }
    }

    const squares = pieces.map((piece) => {
        let className = "";
        if (piece) className = pieceTypes.get(piece) + " ";


        let id = 0;
        if (piece) {
            const pieceTypeToId: Record<string, number> = {
                "q": Flag.promoteToQueen,
                "n": Flag.promoteToKnight,
                "r": Flag.promoteToRook,
                "b": Flag.promoteToBishop,
            }
            id = pieceTypeToId[piece.slice(1)];
        }
        return (
            <div 
                id={"" + id}
                key={piece}
                className={`w-full h-[25%] bg-cover transform cursor-pointer ${className}`}
                onClick={handleLeftClickEvent} 
            >
            </div>

        )
    })
    let className = xTranslations.get(x) + " ";
    className += y != 1 ? "translate-y-0" : "translate-y-[77%]"; 

    const cancelButton = <div 
            className={`w-full h-[12.5%] text-black text-center cursor-pointer`} 
            onClick={props.handleCancel}
            >
                <svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
                    <line x1="40" y1="40" x2="60" y2="20" stroke="black" strokeWidth="3"/>
                    <line x1="40" y1="20" x2="60" y2="40" stroke="black" strokeWidth="3"/>
                </svg>
            </div>;
    return (
        <div className={`shadow-2xl z-20 bg-white w-[12.5%] h-[56.25%] absolute ${className}`}>
            {y === 1 && cancelButton}
            <div className={`w-full h-[87.5%]`}>
                {squares}
            </div>
            {y !== 1 && cancelButton}
        </div>
        
    )
}
