import {GameColor} from "@/app/page"

export type SquareStart = {
    x: number,
    y: number,
    piece: number,
}

export type Position = {
    squares: Array<SquareStart>,
    activeColor: GameColor,
    castling: string,
    enPassant: string,
    halfMove: number,
    fullMove: number,
}
