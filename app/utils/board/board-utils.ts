// import {HandleSquareClickedProps, Move} from "@/app/ui/board/board-layout";
import {SquareRef} from '@/app/ui/board/square';

import {Position, SquareStart} from './posistions';


export const removeHighlights =
    (refsByKey: Record<string, SquareRef|null>, lastMoveIds: Array<string>) => {
        for (const [key, value] of Object.entries(refsByKey)) {
            if (value) value.setHover(false);
        }
        for (const lastMoveId of lastMoveIds) {
            refsByKey[lastMoveId]?.setHover(true);
        }
    }

export const removeLegalMoves =
    (refsByKey: Record<string, SquareRef|null>) => {
        for (const [key, value] of Object.entries(refsByKey)) {
            if (value) value.setLegalMove(false);
            if (value) value.setMoveFlag(undefined);
        }
    }

export const squareIdToString =
    (x: number, y: number) => {
        const numberToLetter: Record<number, string> = {
            1: 'a',
            2: 'b',
            3: 'c',
            4: 'd',
            5: 'e',
            6: 'f',
            7: 'g',
            8: 'h',
        }

        return `${numberToLetter[x]}${y}`
    }


export const moveStringToMove =
    (move: string) => {
        const fromStr = move.slice(0, 2);
        // console.log(fromStr);
        const toStr = move.slice(2, 4);
        const flag = move.slice(4);
        // console.log(toStr);
        const letterToNumber = new Map<string, number>();
        letterToNumber.set('a', 1);
        letterToNumber.set('b', 2);
        letterToNumber.set('c', 3);
        letterToNumber.set('d', 4);
        letterToNumber.set('e', 5);
        letterToNumber.set('f', 6);
        letterToNumber.set('g', 7);
        letterToNumber.set('h', 8);
        const from = {
            x: letterToNumber.get(fromStr.slice(0, 1)),
            y: parseInt(fromStr.slice(1)),
        } 
        const to = {
            x: letterToNumber.get(toStr.slice(0, 1)),
            y: parseInt(toStr.slice(1)),
        }

        return {
            from, to, flag
        }
    }



export const getSquares = (squareRefs: Record<string, SquareRef|null>) => {
    const output = Array<SquareStart>();
    for (let y = 8; y >= 1; y--) {
        for (let x = 1; x <= 8; x++) {
            // console.log(squareRefs[`${x}${y}`].piece);
            const piece = squareRefs[`${x}${y}`]?.piece ?? 0;
            // console.log(`${x}${y}`)
            // console.log(piece);
            const square = {
                x,
                y,
                piece: piece,
            } 
            output.push(square);
        }
    }
    // console.log(output);
    return output;
}
