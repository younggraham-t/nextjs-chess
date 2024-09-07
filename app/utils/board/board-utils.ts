// import {HandleSquareClickedProps, Move} from "@/app/ui/board/board-layout";
import {Ref} from "@/app/ui/board/square";

export const removeHighlights = (refsByKey: Record<string, Ref | null>) => {
    for (const [key, value] of Object.entries(refsByKey)) {
        if (value) value.setHover(false);
    }
}

export const removeLegalMoves = (refsByKey: Record<string, Ref | null>) => {
    for (const [key, value] of Object.entries(refsByKey)) {
            if (value) value.setLegalMove(false);
    }

}


export const  moveStringToMove = (move: string) => {
    const fromStr = move.slice(0,2);
    // console.log(fromStr);
    const toStr = move.slice(2);
    // console.log(toStr);
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
