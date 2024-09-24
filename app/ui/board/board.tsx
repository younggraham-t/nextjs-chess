"use client";
import {useState, useEffect} from "react";
import {Position} from "@/app/utils/board/posistions";
import Square, { SquareRef } from "./square";
import {useRefs} from "@/app/utils/use-refs";
import {removeHighlights, removeLegalMoves} from "@/app/utils/board/board-utils";
import {GameColor} from "@/app/utils/board/posistions";
import {currentFen, fenToPosition, positionToFen} from "@/app/utils/board/fen";
import BitBoard from "@/app/utils/board/bitboard/bitboards";
import MoveGenerator from "@/app/utils/board/bitboard/move-generator";
import Move, {Flag} from "@/app/utils/board/bitboard/move";
import BoardRepresentation from "@/app/utils/board/bitboard/board-representation";
import Piece from "@/app/utils/board/bitboard/piece";
import {useConfirmationModalContext} from "./confirmation";
import Coordinates from "./coordinates";



export type LastMoveRefs = {
    lastMoveStart: SquareRef,
    lastMoveEnd: SquareRef,
}

export default function Board(props: {position: Position}) {
    const [ validMoves, setValidMoves ] = useState<Array<Move>>([]); 
    const {refsByKey, setRef} = useRefs();
    const [ curSquare, setCurSquare ] = useState<string | null>(null);
    const [ position, setPosition ] = useState<Position>(props.position);
    const modalConfirmation = useConfirmationModalContext();

    useEffect(() => { 
        console.log(positionToFen(position));
        const board = new BitBoard(positionToFen(position));
        const moveGenerator = new MoveGenerator();
        const moves =  new Array<Move>();
		moveGenerator.generateMoves(board, moves);
        console.log(MoveGenerator.returnMoves(moves));
        setValidMoves(moves);
    }, [position, refsByKey]);

    const handleSetPosition = (newPosition: Position) => {
        // console.log(newPosition.lastMoveIds);
        setPosition(newPosition);
        handleUpdateSquares(newPosition);
    }

    const handleSquareClicked = async (clickedSquareId: string, moveFlag = 0, shiftOrCtrl = false) => {
        const clickedSquareRef = refsByKey[clickedSquareId];
        if (clickedSquareRef) {
        console.log(Piece.toString(clickedSquareRef.piece) ? Piece.toString(clickedSquareRef.piece) : clickedSquareId);
        const clickedSquareX = parseInt(clickedSquareId.slice(0,1));
        const clickedSquareY = parseInt(clickedSquareId.slice(1));
        //check if moveFlag == 3 (meaning it is a promotion)
        if (moveFlag === 3 && shiftOrCtrl) {
            console.log("moveFlag == 3")
            const promotionChoice = await modalConfirmation.showConfirmation(clickedSquareX, clickedSquareY);
            // console.log(promotionChoice);
            moveFlag = promotionChoice;
        }
        else {
            modalConfirmation.cancelConfirmation();
        }
        //remove highlights and legal move highlights
        removeLegalMoves(refsByKey);
        removeHighlights(refsByKey, position.lastMoveIds) 

        // console.log(clickedSquare.isLegalMove)
        //check if clickedSquare is a legal move and make that move
        if (clickedSquareRef.isLegalMove && curSquare && refsByKey[curSquare]) {
            const curSquareRef = refsByKey[curSquare];
            const startSquare = {
                x: parseInt(curSquare.slice(0,1)),
                y: parseInt(curSquare.slice(1)),
                piece: curSquareRef.piece,
            };
            const startSquareIndex = BoardRepresentation.squareStartToIndex(startSquare)
            const targetSquare = {
                x: clickedSquareX,
                y: clickedSquareY,
                piece: clickedSquareRef.piece,
            }
            const targetSquareIndex = BoardRepresentation.squareStartToIndex(targetSquare)
            const move = new Move(startSquareIndex, targetSquareIndex, moveFlag);
            handleMakeMove(move);
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
    const handleMakeMove = (move: Move) => {
        // console.log(moveFlag)
        // moveFlag should only be -1 if there was a canceled promotion
        if (move.getMoveFlag() == Flag.canceledMove) {
            return;
        }

        const board = new BitBoard(positionToFen(position));
        board.makeMove(move);
        const newFen = currentFen(board);
        const startSquare = BoardRepresentation.indexToSquareStart(move.getStartSquare())
        const targetSquare = BoardRepresentation.indexToSquareStart(move.getTargetSquare())
        const startSquareId = `${startSquare.x}${startSquare.y}`
        const targetSquareId = `${targetSquare.x}${targetSquare.y}`
        const lastMoveIds: Array<string> = [
            startSquareId,
            targetSquareId,
        ]
        const newPosition = fenToPosition(newFen);
        newPosition.lastMoveIds = lastMoveIds;
        handleSetPosition(newPosition);

        removeLegalMoves(refsByKey);
        removeHighlights(refsByKey, newPosition.lastMoveIds) 

    }

    const handleUpdateSquares = (position: Position) => {
        position.squares.map((square) => {
            const curId = `${square.x}${square.y}`
            // console.log(curId);
            const curSquareRef = refsByKey[curId];
            if (curSquareRef) {
                curSquareRef.handleSetPiece(square.piece, curSquareRef);
                if (position.lastMoveIds.includes(curId)) {
                    // console.log(square)
                    curSquareRef.setHover(true);
                }
                
            }
        })   

    }
    
    const squares = props.position.squares.map((square) => {
        const id = `${square.x}${square.y}`;
        return (
            <Square 
            key={id} 
            id={id} 
            positionX={square.x} 
            positionY={square.y} 
            piece={square.piece} 
            handleSquareClicked={handleSquareClicked} 
            ref={element => setRef(element, id)}

            />
           )
    })
    
    return (
            <div>
                <Coordinates isWhitePlayer={true}/>
                {squares}
            </div>

    )
}
