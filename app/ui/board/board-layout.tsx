"use client"
import {fenToPosition} from "@/app/utils/board/fen";
import Board from "./board";
import ConfirmationModalContextProvider from "./confirmation";
import {Suspense} from "react";
import {BoardSkeleton} from "./skeletons";

export default function BoardLayout(props: {fen: string, disabled?: boolean}) {
    const pos = fenToPosition(props.fen);

    return (
        <div className={`flex m-12 h-[480px] w-[480px] bg-board bg-cover relative`}>
            <ConfirmationModalContextProvider>
                <Suspense fallback={<BoardSkeleton/>}>
                    <Board position={pos} disabled={props.disabled}/>
                </Suspense>
            </ConfirmationModalContextProvider>
        </div>
    )
}
