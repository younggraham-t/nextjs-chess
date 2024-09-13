"use client";
import {useState, useEffect, SetStateAction, Dispatch, useRef} from "react";
import {Position, SquareStart} from "@/app/utils/board/posistions";
import Square, { SquareRef } from "./square";
import {useRefs} from "@/app/utils/use-refs";
import {removeHighlights, removeLegalMoves, moveStringToMove, getSquares, squareIdToString} from "@/app/utils/board/board-utils";
import {GameColor} from "@/app/page";
import {positionToFen} from "@/app/utils/board/fen";
import BitBoard from "@/app/utils/board/bitboard/bitboards";
import MoveGenerator from "@/app/utils/board/bitboard/move-generator";
import Move, {Flag} from "@/app/utils/board/bitboard/move";
import BoardRepresentation from "@/app/utils/board/bitboard/board-representation";
import Piece from "@/app/utils/board/bitboard/piece";
import ConfirmationModalContextProvider from "./confirmation";



export type LastMoveRefs = {
    lastMoveStart: SquareRef,
    lastMoveEnd: SquareRef,
}

export default function BoardLayout(props: {position: Position}) {
    const [ validMoves, setValidMoves ] = useState<Array<Move>>([]); 
    const {refsByKey, setRef} = useRefs();
    const [ curSquare, setCurSquare ] = useState<string | null>(null);
    const [ position, setPosition ] = useState<Position>(props.position);
    const [ lastMove, setLastMove ] = useState<LastMoveRefs>();
    const [ enpassantPawn, setEnpassantPawn ] = useState<SquareRef | null>(null);

    useEffect(() => { 
        const board = new BitBoard(positionToFen(position));
        const moveGenerator = new MoveGenerator(board);
        const moves = moveGenerator.generateMoves();
        console.log(moveGenerator.returnMoves(moves));
        console.log(position);
        setValidMoves(moves);
        removeHighlights(refsByKey, lastMove);
    }, [position, lastMove, refsByKey]);

    const handleSetPosition = (squareRefs?: Record<string, SquareRef | null>, 
                            activeColor?: GameColor, 
                            castling?: string, 
                            enPassant?: string, 
                            halfMove?: number, 
                            fullMove?: number ) => {
        let updateSquares: Array<SquareStart>;
        if (squareRefs) {
            updateSquares = getSquares(squareRefs);
            // console.log(updateSquares);
        }
        else {
            updateSquares = position.squares;
        }
        const updateActiveColor = activeColor?? position.activeColor;
        const updateCastling = castling?? position.castling;
        const updateEnPassant = enPassant?? position.enPassant;
        const updateHalfMove = halfMove?? position.halfMove;
        const updateFullMove = fullMove?? position.fullMove;

        const newPosition: Position = {
            squares: updateSquares,
            activeColor: updateActiveColor,
            castling: updateCastling,
            enPassant: updateEnPassant,
            halfMove: updateHalfMove,
            fullMove: updateFullMove,
        }
        // console.log(newPosition);
        setPosition(newPosition);
    }

    const handleSquareClicked = (clickedSquareId: string, moveFlag = 0) => {
        const clickedSquareRef = refsByKey[clickedSquareId];
        if (clickedSquareRef) {
        console.log(Piece.toString(clickedSquareRef.piece) ? Piece.toString(clickedSquareRef.piece) : clickedSquareId);
        const clickedSquareX = parseInt(clickedSquareId.slice(0,1));
        const clickedSquareY = parseInt(clickedSquareId.slice(1));
        //remove highlights and legal move highlights
        removeLegalMoves(refsByKey);
        removeHighlights(refsByKey, lastMove) 

        // console.log(clickedSquare.isLegalMove)
        //check if clickedSquare is a legal move and make that move
        if (clickedSquareRef.isLegalMove && curSquare && refsByKey[curSquare]) {
            const curSquareRef = refsByKey[curSquare];
            handleMakeMove(clickedSquareRef, curSquareRef, moveFlag);
            return;
        }

        // check if the clicked square has a piece
        if (clickedSquareRef.piece) {
            const curPieceColor = Piece.isColor(clickedSquareRef.piece, Piece.white) ? GameColor.white : GameColor.black
            //set curSquare for future checks
            setCurSquare(clickedSquareId);

            // set hover on clicked square

            if (curPieceColor === position.activeColor) clickedSquareRef.setHover(true);

            // display valid moves from clicked square
            for (const move of validMoves) {
                   const from = BoardRepresentation.indexToSquareStart(move.getStartSquare());
                   const to = BoardRepresentation.indexToSquareStart(move.getTargetSquare());
                   const flag = move.getMoveFlag();
                   if (from.x === clickedSquareX && from.y === clickedSquareY) {
                       const toId = `${to.x}${to.y}`;
                       // console.log(toId)
                       refsByKey[toId]?.setLegalMove(true);
                       if (flag > 2 && flag < 7) {
                           refsByKey[toId]?.setMoveFlag(3);
                       }
                       else {

                          refsByKey[toId]?.setMoveFlag(flag);
                       }

                       // console.log(from)
                        // console.log(toId); 
                   }

            }
            
        }
        
        }
    }
    const handleMakeMove = (clickedSquare: SquareRef, curSquareRef: SquareRef, moveFlag: number) => {
        // console.log(moveFlag)
        let newLastMove: LastMoveRefs;
        if (curSquareRef && curSquareRef.piece) {
            let curPiece = curSquareRef.piece;
            const curPieceColor = Piece.getColor(curPiece);
            const curPieceType = Piece.getPieceType(curPiece);

            let castling = position.castling;
            let enPassant = "";
            let halfMove = position.halfMove;
            //handle updating half move clock
            if ((!clickedSquare.piece || curPieceType != Piece.pawn) && position.activeColor === GameColor.black) {
                halfMove++;
    
            }
            //handle removing castling options
            if (curPieceType == Piece.rook) {
                // console.log(curSquareRef.id)
                switch (curSquareRef.id) {
                    case "11":
                        castling = castling.replace("Q", "");
                         break;
                    case "81":
                        castling = castling.replace("K", "");
                        break;
                    case "18":
                        castling = castling.replace("q", "");
                        break;
                    case "88":
                        // console.log("black kingside")
                        castling = castling.replace("k", "");
                        break;
                }
            }
            else if (curPieceType == Piece.king) {
                switch (curPieceColor) {
                    case Piece.white:
                        castling = castling.replace("K", "");
                        castling = castling.replace("Q", "");
                        break;
                    case Piece.black:
                        castling = castling.replace("k", "");
                        castling = castling.replace("q", "");
                        break;
                }
            }
            if (castling == "") {
                castling = "-";
            }
            

            //handle move flags
            if (moveFlag) {
                switch (moveFlag) {
                    case Flag.pawnTwoForward: 
                        const epOffset = position.activeColor === GameColor.white ? -1 : 1
                        const clickedSquareX = parseInt(clickedSquare.id.slice(0,1));
                        const clickedSquareY = parseInt(clickedSquare.id.slice(1));
                        enPassant = squareIdToString(clickedSquareX, clickedSquareY + epOffset);
                        setEnpassantPawn(refsByKey[clickedSquare.id]);
                        break; 
                    case Flag.enPassantCapture:
                        if (enpassantPawn) {
                            enpassantPawn.handleSetPiece(Piece.none, enpassantPawn);
                            setEnpassantPawn(null);
                        }
                        break;
                    case Flag.castling:
                        const squareIdToRookInfo: Record<string, Record<string, string>> = {
                        "71": {rook: "81", moveTo: "61"},
                        "31": {rook: "11", moveTo: "41"},
                        "78": {rook: "88", moveTo: "68"},
                        "38": {rook: "18", moveTo: "48"},

                        }
                        const rookToMoveId = squareIdToRookInfo[clickedSquare.id]["rook"];
                        const rookFinalLocation = squareIdToRookInfo[clickedSquare.id]["moveTo"];
                        const rookRef = refsByKey[rookToMoveId];
                        const rookFinalLocationRef = refsByKey[rookFinalLocation];
                        if (rookRef && rookFinalLocationRef) {
                            const rook = rookRef.piece;
                            rookRef.handleSetPiece(Piece.none, rookRef);
                            rookFinalLocationRef.handleSetPiece(rook, rookFinalLocationRef);

                        }

                        break;
                    case Flag.promoteToQueen:
                        curPiece = curPieceColor + Piece.queen;
                        console.log(curPiece)
                        break;
                    case Flag.promoteToKnight:
                        curPiece = curPieceColor + Piece.knight;
                        console.log(curPiece)
                        break;
                    case Flag.promoteToRook:
                        curPiece = curPieceColor + Piece.rook;
                        console.log(curPiece)
                        break;
                    case Flag.promoteToBishop:
                        curPiece = curPieceColor + Piece.bishop;
                        console.log(curPiece)
                        break;
                }
            }
            //put curPiece on new square
            clickedSquare.handleSetPiece(curPiece, clickedSquare)
            const lastMoveStart = clickedSquare;
            //remove piece from old square
            curSquareRef.handleSetPiece(Piece.none, curSquareRef);
            const lastMoveEnd = curSquareRef;

            newLastMove = {lastMoveStart, lastMoveEnd}
            setLastMove(newLastMove);
            //set curPiece to null
            setCurSquare(null);
            removeLegalMoves(refsByKey);

            //update position
            const newActiveColor = position.activeColor === GameColor.white ? GameColor.black : GameColor.white;
            const newFullMove = newActiveColor === GameColor.white ? position.fullMove + 1 : position.fullMove;
            handleSetPosition(refsByKey, newActiveColor, castling, enPassant, halfMove, newFullMove );

            
        }
    }
    
    const squares = props.position.squares.map((square) => {
        const id = `${square.x}${square.y}`;
        return (
        <ConfirmationModalContextProvider key={id}>
            <Square 
            key={id} 
            id={id} 
            positionX={square.x} 
            positionY={square.y} 
            piece={square.piece} 
            handleSquareClicked={handleSquareClicked} 
            ref={element => setRef(element, id)}

            />
        </ConfirmationModalContextProvider>
           )
    })
    return (
            <div className={`flex m-12 h-[480px] w-[480px] bg-board bg-cover relative`}>
                {squares}
            </div>

    )
}
