import BitBoard from "@/app/utils/board/bitboard/bitboards";
import { perft } from "@/app/utils/board/bitboard/perft";
import { startFen } from "@/app/utils/board/fen";


describe("start position", () => {


    test('starting position depth 1', () => {
        const board = new BitBoard(startFen);
        expect(perft(board, 1)).toBe(BigInt(20))
    }); 
    test('starting position depth 2', () => {
        const board = new BitBoard(startFen);
        expect(perft(board, 2)).toBe(BigInt(400))
    }); 
    test('starting position depth 3', () => {
        const board = new BitBoard(startFen);
        expect(perft(board, 3)).toBe(BigInt(8902))
    }); 
    test('starting position depth 4', () => {
        const board = new BitBoard(startFen);
        expect(perft(board, 4)).toBe(BigInt(197281))
    }); 
    test('starting position depth 5', () => {
        const board = new BitBoard(startFen);
        expect(perft(board, 5)).toBe(BigInt(4865609))
    }); 
    // test('starting position depth 6', () => {
    //     const board = new BitBoard(startFen);
    //     expect(perft(board, 6)).toBe(BigInt(119060324))
    // }); 
    // test('starting position depth 7', () => {
        // const board = new BitBoard(startFen);
    //     expect(perft(board, 7)).toBe(BigInt(3195901860))
    // }); 

    // test('starting position depth 8', () => {
        // const board = new BitBoard(startFen);
        // expect(perft(board, 8)).toBe(BigInt(84998978956))
    // }); 
})

describe("position 2", () => {
    const positionFen = "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq -" 

    test('position 2 depth 1', () => {
        const board = new BitBoard(positionFen);
        expect(perft(board, 1)).toBe(BigInt(48))
    }); 
    test('position 2 depth 2', () => {
        const board = new BitBoard(positionFen);
        expect(perft(board, 2)).toBe(BigInt(2039))
    }); 
    test('position 2 depth 3', () => {
        const board = new BitBoard(positionFen);
        expect(perft(board, 3)).toBe(BigInt(97862))
    }); 
    test('position 2 depth 4', () => {
        const board = new BitBoard(positionFen);
        expect(perft(board, 4)).toBe(BigInt(4085603))
    }); 
    // test('position 2 depth 5', () => {
    //     const board = new BitBoard(positionFen);
    //     expect(perft(board, 5)).toBe(BigInt(193690690))
    // }); 
    // test('position 2 depth 6', () => {
    //     const board = new BitBoard(positionFen);
    //     expect(perft(board, 6)).toBe(BigInt(8031647685))
    // }); 

})

describe("position 3", () => {
    const positionFen = "8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - -"

    test('position 3 depth 1', () => {
        const board = new BitBoard(positionFen);
        expect(perft(board, 1)).toBe(BigInt(14))
    }); 
    test('position 3 depth 2', () => {
        const board = new BitBoard(positionFen);
        expect(perft(board, 2)).toBe(BigInt(191))
    }); 
    test('position 3 depth 3', () => {
        const board = new BitBoard(positionFen);
        expect(perft(board, 3)).toBe(BigInt(2812))
    }); 
    test('position 3 depth 4', () => {
        const board = new BitBoard(positionFen);
        expect(perft(board, 4)).toBe(BigInt(43238))
    }); 
    test('position 3 depth 5', () => {
        const board = new BitBoard(positionFen);
        expect(perft(board, 5)).toBe(BigInt(674624))
    }); 
    // test('position 3 depth 6', () => {
    //     const board = new BitBoard(positionFen);
    //     expect(perft(board, 6)).toBe(BigInt(11030083))
    // }); 

})


describe("position 5", () => {
    const positionFen = "rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8"

    test('position 5 depth 1', () => {
        const board = new BitBoard(positionFen);
        expect(perft(board, 1)).toBe(BigInt(44))
    }); 
    test('position 5 depth 2', () => {
        const board = new BitBoard(positionFen);
        expect(perft(board, 2)).toBe(BigInt(1486))
    }); 
    test('position 5 depth 3', () => {
        const board = new BitBoard(positionFen);
        expect(perft(board, 3)).toBe(BigInt(62379))
    }); 
    test('position 5 depth 4', () => {
        const board = new BitBoard(positionFen);
        expect(perft(board, 4)).toBe(BigInt(2103487))
    }); 
    // test('position 5 depth 5', () => {
    //     const board = new BitBoard(positionFen);
    //     expect(perft(board, 5)).toBe(BigInt(89941194))
    // }); 

})
