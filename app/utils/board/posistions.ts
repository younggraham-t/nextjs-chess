
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
    lastMoveIds: Array<string>,
}


export enum GameColor {
    white = 'w',
    black = 'b',
}
