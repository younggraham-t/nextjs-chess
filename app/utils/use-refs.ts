import { useRef } from "react"
import {SquareRef } from "../ui/board/square" 
export const useRefs = () => {
  const refsByKey = useRef<Record<string,SquareRef | null>>({})

  const setRef = (element:SquareRef | null, key: string) => {
    refsByKey.current[key] = element;
  }

  return {refsByKey: refsByKey.current, setRef};
}
