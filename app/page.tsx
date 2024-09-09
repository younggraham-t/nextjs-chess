import BoardLayout, {} from "./ui/board/board-layout";
import { fenToPosition, startFen } from "./utils/board/fen";

export enum GameColor {
    white = "w",
    black = "b",
}
export type Player = {
    color: GameColor,
}
export default function Home() {
    const pos = fenToPosition(startFen);
  return (
      <BoardLayout position={pos}/>
  );
}
