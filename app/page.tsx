import BoardLayout, {} from "./ui/board/board-layout";
import {startPos} from "@/app/utils/board/posistions";

export default function Home() {
  return (
      <BoardLayout position={startPos}/>
  );
}
