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
    const pos = fenToPosition("8/8/8/8/8/8/6Q1/8 w - - 0 1");
    // const pos = fenToPosition("n5KB/b3r3/1k6/3B1N2/3r4/8/3N2Q1/n1R2bRq w - - 0 1");
  return (
      <BoardLayout position={pos}/>
  );
}
