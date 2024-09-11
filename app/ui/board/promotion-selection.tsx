import { xTranslations, yTranslations, pieceTypes } from "./square-tw-classes";
import { MouseEvent } from "react";

export default function PromotionSelection(props: {resolution: any, positionX: number, positionY: number}) {

    const {resolution, positionX, positionY} = props;


    let pieces: Array<string | undefined>;
    if (positionY == 1) {
        pieces = [pieceTypes.get("bq"), pieceTypes.get("bn"), pieceTypes.get("br"), pieceTypes.get("bb")];

    }
    else {
        pieces = [pieceTypes.get("wq"), pieceTypes.get("wn"), pieceTypes.get("wr"), pieceTypes.get("wb")];
    }

    const handleLeftClickEvent = ( e: MouseEvent<HTMLDivElement> ) => {
        const elementId = e.currentTarget.getAttribute("id");
        if (elementId) {
            const promotionType = parseInt(elementId);
            resolution(promotionType)
            e.preventDefault();
        }
    }

    const squares = pieces.map((piece, i) => {
        const yOffset = positionY === 1 ? 1: -1;
        let className = piece + " ";
        className += xTranslations.get(positionX) + " ";
        className += yTranslations.get(positionY + (yOffset * i)); 


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
                className={`w-[12.5%] h-[12.5%] absolute bg-cover transform ${className}`}
                onClick={handleLeftClickEvent} 
            >
            </div>

        )
    })
    return (
        <div className={`bg-white`}>
            {squares};
        </div>
        
    )
}
