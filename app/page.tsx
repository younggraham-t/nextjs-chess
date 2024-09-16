import BoardLayout, {} from "./ui/board/board-layout";
import { startFen } from "./utils/board/fen";


export default function Home() {
    // const fen = "8/8/8/8/8/8/6Q1/8 w - - 0 1";
    // const fen = "n5KB/b3r3/1k6/3B1N2/3r4/8/3N2Q1/n1R2bRq w - - 0 1";
    const fen = "8/PPPP4/8/1k1K4/8/8/4pppp/8 b - - 0 1";
    // const fen = startFen;
  return (
      <BoardLayout fen={fen}/>
  );
}
