import { xTranslations, yTranslations, pieceTypes } from "./square-tw-classes";
import { Dispatch, MouseEvent, SetStateAction } from "react";

export default function PromotionSelection(props: {x: number, y: number, handleClick: (value: number) => void}) {

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

    const squares = pieces.map((piece, i) => {
        // const yOffset = y === 1 ? 1: -1;
        let className = "";
        if (piece) className = pieceTypes.get(piece) + " ";
        // className += xTranslations.get(x) + " ";
        // className += yTranslations.get(y + (yOffset * i)); 


        let id = 0;
        if (piece) {
            const pieceTypeToId: Record<string, number> = {
                "q": 3,
                "n": 4,
                "r": 5,
                "b": 6,
            }
            id = pieceTypeToId[piece.slice(1)];
        }
        return (
            <div 
                id={"" + id}
                key={piece}
                className={`w-full h-[25%] bg-cover transform ${className}`}
                onClick={handleLeftClickEvent} 
            >
            </div>

        )
    })
    let className = xTranslations.get(x) + " ";
    className += y != 1 ? "translate-y-0" : "translate-y-[100%]"; 
    return (
        <div className={`shadow-lg z-10 bg-white w-[12.5%] h-[50%] absolute ${className}`}>
            {squares}
        </div>
        
    )
}
