import Coord from "./coord";

export default class BoardRepresentation {
    /*
    * the ranks and file are represented by a 6 bit number 
    * the first three bits i.e 000111 are the file
    * the other three bits i.e 111000 are the rank
     */
    static fileNames: Array<string> = ["a", "b", "c", "d", "e", "f", "g", "h"]
    static rankNames: Array<string> = ["1", "2", "3", "4", "5", "6", "7", "8"]

    static getRankIndex(squareIndex: number) {
        return squareIndex >> 3;
    }

    static getFileIndex(squareIndex: number) {
        return squareIndex & 0b000111;
    }

    //get the file from a coordinate ie 1,0 would be a2 which is represented as 0b001000
    static getIndexFromCoord(rankIndex: number, fileIndex: number) {
        return rankIndex * 8 + fileIndex;
    }

    static coordFromIndex(squareIndex: number) {
        return new Coord(this.getFileIndex(squareIndex), this.getRankIndex(squareIndex))
    }
    

    static isLightSquare(squareIndex: number) {
        const file = this.getFileIndex(squareIndex);
        const rank = this.getRankIndex(squareIndex);
        return (rank + file) % 2 != 0;
    }
}
