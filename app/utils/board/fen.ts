import { SquareStart, Position } from "@/app/utils/board/posistions";
import { GameColor } from "@/app/page";
// import BitBoard from "./bitboard/bitboards";
// import Piece from "./bitboard/piece";
// import BoardRepresentation from "./bitboard/board-representation";

export const startFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
export const fenToPosition = (fen: string) => {
    const squares = new Array<SquareStart>();

    const fenParts = fen.split(" ");
    const ranks = fenParts[0].split("/");
    const activeColor = fenParts[1] === "w" ? GameColor.white : GameColor.black;
    const castling = fenParts[2];
    const enPassant = fenParts[3];
    const halfMove = parseInt(fenParts[4]);
    const fullMove = parseInt(fenParts[5]);

    let x = 1;
    let y = 8;
    for (const rank of ranks) {
        for (const char of rank) {
            if (!isNaN(parseInt(char))) {
                for (let i = 0; i < parseInt(char); i++) {
                    const newSquare = {
                        x,
                        y,
                    }
                    // console.log(newSquare);
                    squares.push(newSquare);
                    x++;
                }
                continue;
            }
            const piece = char.toUpperCase() == char ? `w${char.toLowerCase()}` : `b${char}`;
            const newSquare = {
                x: x,
                y: y,
                piece: piece, 
            }  
            squares.push(newSquare);
            x++;
        }
        x = 1;
        y--;
    }

    const output = {
        squares,
        activeColor,
        castling,
        enPassant,
        halfMove,
        fullMove,
    }



    return output;
}


export const positionToFen = (position: Position) => {
    const { squares } = position;
    // console.log(squares);
    const ranks = Array<string>();

    let emptySquareCounter = 0;
    let currentRank = "";
    let curColCounter = 1;
    for (const square of squares) {
        // console.log(curColCounter);
        if (!square.piece) {
            emptySquareCounter++;
        }
        else {
            if (emptySquareCounter > 0) {
                currentRank += `${emptySquareCounter}`;
                emptySquareCounter = 0; 
            }
            currentRank += square.piece.slice(0,1) == "w" ? square.piece.slice(1).toUpperCase() : square.piece.slice(1);

        }
        if (curColCounter == 8) {
            if (emptySquareCounter > 0) {
                currentRank += `${emptySquareCounter}`;
                emptySquareCounter = 0
            }
            ranks.push(currentRank);
            currentRank = "";
            curColCounter = 0;
        }
        curColCounter++;
        
    }
    
    const ranksStr = ranks.join("/");
    return `${ranksStr} ${position.activeColor} ${position.castling} ${position.enPassant} ${position.halfMove} ${position.fullMove}`
}

// export const bitboardToPosition = (bitboard: BitBoard) => {
//     const squares = bitboard.squares;
//     const positionSquares = new Array<SquareStart>();

//     for (let i = squares.length - 1; i >= 0; i--) {
//         const rank = BoardRepresentation.getRankIndex(i) + 1;
//         const file = BoardRepresentation.getRankIndex(i) + 1;
//         const piece = Piece.toString(squares[i]);
//         positionSquares.push({
//             x: file,
//             y: rank,
//             piece: piece,
//         })
//     }
//     const activeColor = bitboard.whiteToMove ? GameColor.white : GameColor.black;
//     let castlingRights = "";
//     if ((0b1 & bitboard.currentGameState >> 0) === 1) {
//         castlingRights += "K"; 
//     }
//     if ((0b1 & bitboard.currentGameState >> 1) === 1) {
//         castlingRights += "Q";
//     }
//     if ((0b1 & bitboard.currentGameState >> 2) === 1) {
//         castlingRights += "k";
//     }
//     if ((0b1 & bitboard.currentGameState >> 3) === 1) {
//         castlingRights += "q";
//     }



// }
