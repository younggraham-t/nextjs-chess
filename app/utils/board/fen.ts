import {GameColor, Position, SquareStart} from '@/app/utils/board/posistions';

import BitBoard from './bitboard/bitboards';
import BoardRepresentation from './bitboard/board-representation';
import Piece from './bitboard/piece';

export const startFen =
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
export const fenToPosition =
    (fen: string) => {
        const squares = new Array<SquareStart>();
        // console.log(fen);

        const fenParts = fen.split(' ');
        const ranks = fenParts[0].split('/');
        const activeColor =
            fenParts[1] === 'w' ? GameColor.white : GameColor.black;
        const castling = fenParts[2];
        const enPassant = fenParts[3];
        const halfMove = parseInt(fenParts[4]);
        const fullMove = parseInt(fenParts[5]);

        let x = 1;
        let y = 8;
        for (const rank of ranks) {
            // console.log(rank);
            for (const char of rank) {
                if (!isNaN(parseInt(char))) {
                    for (let i = 0; i < parseInt(char); i++) {
                        const newSquare = {
                            x,
                            y,
                            piece: 0,
                        }
                                          // console.log(newSquare);
                                          squares.push(newSquare);
                        x++;
                    }
                    continue;
                }
                // console.log(char);
                const pieceName = char.toUpperCase() == char ?
                    `w${char.toLowerCase()}` :
                    `b${char}`;
                // console.log(pieceName);
                const piece = Piece.pieceNameToPiece(pieceName)
                const newSquare = {
                    x: x,
                    y: y,
                    piece: piece,
                }
                                  // console.log(newSquare);
                                  squares.push(newSquare);
                x++;
            }
            x = 1;
            y--;
        }
        const lastMoveIds = new Array<string>();

        const output = {
            squares,
            activeColor,
            castling,
            enPassant,
            halfMove,
            fullMove,
            lastMoveIds,
        }



        return output;
    }


export const positionToFen =
    (position: Position) => {
        const {squares} = position;
        // console.log(squares);
        const ranks = Array<string>();

        let emptySquareCounter = 0;
        let currentRank = '';
        let curColCounter = 1;
        for (const square of squares) {
            // console.log(curColCounter);
            if (!square.piece) {
                emptySquareCounter++;
            } else {
                if (emptySquareCounter > 0) {
                    currentRank += `${emptySquareCounter}`;
                    emptySquareCounter = 0;
                }

                let pieceToAdd = '';
                switch (Piece.getPieceType(square.piece)) {
                    case Piece.pawn:
                        pieceToAdd += 'P';
                        break;
                    case Piece.knight:
                        pieceToAdd += 'N';
                        break;
                    case Piece.bishop:
                        pieceToAdd += 'B';
                        break;
                    case Piece.rook:
                        pieceToAdd += 'R';
                        break;
                    case Piece.queen:
                        pieceToAdd += 'Q';
                        break;
                    case Piece.king:
                        pieceToAdd += 'K';
                        break;
                }
                currentRank += Piece.isColor(square.piece, Piece.white) ?
                    pieceToAdd :
                    pieceToAdd.toLowerCase();
            }
            if (curColCounter == 8) {
                if (emptySquareCounter > 0) {
                    currentRank += `${emptySquareCounter}`;
                    emptySquareCounter = 0
                }
                ranks.push(currentRank);
                currentRank = '';
                curColCounter = 0;
            }
            curColCounter++;
        }

        const ranksStr = ranks.join('/');
        return `${ranksStr} ${position.activeColor} ${position.castling} ${
            position.enPassant} ${position.halfMove} ${position.fullMove}`
    }

// Get the fen string of the current position
export const currentFen = (board: BitBoard) => {
    let fen = '';
    for (let rank = 7; rank >= 0; rank--) {
        let numEmptyFiles = 0;
        for (let file = 0; file < 8; file++) {
            const i = rank * 8 + file;
            const piece = board.squares[i];
            if (piece != 0) {
                if (numEmptyFiles != 0) {
                    fen += numEmptyFiles;
                    numEmptyFiles = 0;
                }
                const isBlack = Piece.isColor(piece, Piece.black);
                const pieceType = Piece.getPieceType(piece);
                let pieceChar = ' ';
                switch (pieceType) {
                    case Piece.rook:
                        pieceChar = 'R';
                        break;
                    case Piece.knight:
                        pieceChar = 'N';
                        break;
                    case Piece.bishop:
                        pieceChar = 'B';
                        break;
                    case Piece.queen:
                        pieceChar = 'Q';
                        break;
                    case Piece.king:
                        pieceChar = 'K';
                        break;
                    case Piece.pawn:
                        pieceChar = 'P';
                        break;
                }
                fen += (isBlack) ? pieceChar.toLowerCase() : pieceChar;
            } else {
                numEmptyFiles++;
            }
        }
        if (numEmptyFiles != 0) {
            fen += numEmptyFiles;
        }
        if (rank != 0) {
            fen += '/';
        }
    }

    // Side to move
    fen += ' ';
    fen += (board.whiteToMove) ? 'w' : 'b';

    // Castling
    const whiteKingside = (board.currentGameState & 1) == 1;
    const whiteQueenside = (board.currentGameState >> 1 & 1) == 1;
    const blackKingside = (board.currentGameState >> 2 & 1) == 1;
    const blackQueenside = (board.currentGameState >> 3 & 1) == 1;
    fen += ' ';
    fen += (whiteKingside) ? 'K' : '';
    fen += (whiteQueenside) ? 'Q' : '';
    fen += (blackKingside) ? 'k' : '';
    fen += (blackQueenside) ? 'q' : '';
    fen += ((board.currentGameState & 15) == 0) ? '-' : '';

    // En-passant
    fen += ' ';
    const epFile = (board.currentGameState >> 4) & 15;
    if (epFile == 0) {
        fen += '-';
    } else {
        const fileName = BoardRepresentation.fileNames[epFile - 1].toString();
        const epRank = (board.whiteToMove) ? 6 : 3;
        fen += fileName + epRank;
    }

    // 50 move counter
    fen += ' ';
    fen += board.halfMoveCounter;

    // Full-move count (should be one at start, and increase after each move by
    // black)
    fen += ' ';
    fen += (board.fullMove / 2) + 1;

    return fen;
}
