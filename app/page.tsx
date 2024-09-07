import BoardLayout, {GameColor} from "./ui/board/board-layout";
import {startPos} from "./ui/board/posistions";

export default function Home() {
  return (
      <BoardLayout position={startPos}/>
  );
}
