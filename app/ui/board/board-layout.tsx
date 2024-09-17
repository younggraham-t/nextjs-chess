"use client"
import {fenToPosition} from "@/app/utils/board/fen";
import Board from "./board";
import ConfirmationModalContextProvider from "./confirmation";

export default function BoardLayout(props: {fen: string}) {
    const pos = fenToPosition(props.fen);

    return (
        <div className={`flex m-12 h-[480px] w-[480px] bg-board bg-cover relative`}>
            <ConfirmationModalContextProvider>
                <Board position={pos} />
            </ConfirmationModalContextProvider>
        </div>
    )
}
