import BoardLayout, {} from "./ui/board/board-layout";
import { fenToPosition } from "./utils/board/fen";

export enum GameColor {
    white = "w",
    black = "b",
}
export type Player = {
    color: GameColor,
}
export default function Home() {
    const startPos = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    const pos = fenToPosition(startPos);
  return (
      <BoardLayout position={pos}/>
  );
}
