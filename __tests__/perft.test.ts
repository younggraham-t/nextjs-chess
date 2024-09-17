import Perft from "@/app/utils/board/bitboard/perft";
import { startFen } from "@/app/utils/board/fen";


describe("start position", () => {
    const positionFen = startFen;
    const perft = new Perft(positionFen);

    // test('starting position depth 1', () => {
    //     expect(perft.runPerft(1)).toBe(BigInt(20))
    // }); 
    // test('starting position depth 2', () => {
    //     expect(perft.runPerft(2)).toBe(BigInt(400))
    // }); 
    // test('starting position depth 3', () => {
    //     expect(perft.runPerft(3)).toBe(BigInt(8902))
    // }); 
    // test('starting position depth 4', () => {
    //     expect(perft.runPerft(4)).toBe(BigInt(197281))
    // }); 
    // test('starting position depth 5', () => {
    //     expect(perft.runPerft(5)).toBe(BigInt(4865609))
    // }); 
    test('starting position depth 6', () => {
        expect(perft.runPerft(6)).toBe(BigInt(119060324))
    }); 
    // test('starting position depth 7', () => {
    //     expect(perft.runPerft(7)).toBe(BigInt(3195901860))
    // }); 

    // test('starting position depth 8', () => {
        // expect(perft.runPerft(8)).toBe(BigInt(84998978956))
    // }); 
})

describe("position 2", () => {
    const positionFen = "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq -" 
    const perft = new Perft(positionFen);


    // test('position 2 depth 1', () => {
    //     expect(perft.runPerft(1)).toBe(BigInt(48))
    //     perft.reset();
    // }); 
    // test('position 2 depth 2', () => {
    //     expect(perft.runPerft(2)).toBe(BigInt(2039))
    //     perft.reset();
    // }); 
    // test('position 2 depth 3', () => {
    //     expect(perft.runPerft(3)).toBe(BigInt(97862))
    //     perft.reset();
    // }); 
    // test('position 2 depth 4', () => {
    //     expect(perft.runPerft(4)).toBe(BigInt(4085603))
    //     perft.reset();
    // }); 
    test('position 2 depth 5', () => {
        expect(perft.runPerft(5)).toBe(BigInt(193690690))
    }); 
    // test('position 2 depth 6', () => {
    //     expect(perft.runPerft(6)).toBe(BigInt(8031647685))
    // }); 

})

describe("position 3", () => {
    const positionFen = "8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - -"
    const perft = new Perft(positionFen);

    // test('position 3 depth 1', () => {
    //     expect(perft.runPerft(1)).toBe(BigInt(14))
    // }); 
    // test('position 3 depth 2', () => {
    //     expect(perft.runPerft(2)).toBe(BigInt(191))
    // }); 
    // test('position 3 depth 3', () => {
    //     expect(perft.runPerft(3)).toBe(BigInt(2812))
    // }); 
    // test('position 3 depth 4', () => {
    //     expect(perft.runPerft(4)).toBe(BigInt(43238))
    // }); 
    // test('position 3 depth 5', () => {
    //     expect(perft.runPerft(5)).toBe(BigInt(674624))
    // }); 
    test('position 3 depth 6', () => {
        expect(perft.runPerft(6)).toBe(BigInt(11030083))
    }); 

})


describe("position 5", () => {
    const positionFen = "rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8"
    const perft = new Perft(positionFen);

    // test('position 5 depth 1', () => {
    //     expect(perft.runPerft(1)).toBe(BigInt(44))
    // }); 
    // test('position 5 depth 2', () => {
    //     expect(perft.runPerft(2)).toBe(BigInt(1486))
    // }); 
    // test('position 5 depth 3', () => {
    //     expect(perft.runPerft(3)).toBe(BigInt(62379))
    // }); 
    // test('position 5 depth 4', () => {
    //     expect(perft.runPerft(4)).toBe(BigInt(2103487))
    // }); 
    test('position 5 depth 5', () => {
        expect(perft.runPerft(5)).toBe(BigInt(89941194))
    }); 

})
