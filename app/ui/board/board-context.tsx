import {Position} from "@/app/utils/board/posistions"
import React, {Dispatch, SetStateAction, useContext, useState} from "react"

type BoardContextType = {
    previousPositions: Array<Position> 
    pushToPreviousPositions: (newPosition: Position) => void
    currentPositionIndex: number,
    setPositionIndex: Dispatch<SetStateAction<number>>,
}

const BoardContext = React.createContext({} as BoardContextType)

type BoardContextProviderProps = {
    children: React.ReactNode,
    startPos: Position
}

export default function BoardContextProvider(props: BoardContextProviderProps) {
    const [previousPositions, setPreviousPositions ] = useState<Array<Position>>([props.startPos]);
    const [ currentPositionIndex, setPositionIndex ] = useState<number>(0);

    const handleUpdatePreviousPositions = (newPosition: Position) => {
        const newPrevPositions = Array.from(previousPositions);
        newPrevPositions.push(newPosition);
        setPreviousPositions(newPrevPositions);
    }

    const boardContext: BoardContextType = {
        previousPositions: previousPositions,
        pushToPreviousPositions: handleUpdatePreviousPositions,
        currentPositionIndex,
        setPositionIndex,
    }

    return (
        <BoardContext.Provider value={boardContext}>
            {props.children}
        </BoardContext.Provider>
    )
}

export const useBoardContext = (): BoardContextType => useContext(BoardContext)
