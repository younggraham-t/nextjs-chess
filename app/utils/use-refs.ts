import { useRef } from "react"
import { Ref } from "../ui/board/square" 
export const useRefs = () => {
  const refsByKey = useRef<Record<string,Ref | null>>({})

  const setRef = (element: Ref | null, key: string) => {
    refsByKey.current[key] = element;
  }

  return {refsByKey: refsByKey.current, setRef};
}
