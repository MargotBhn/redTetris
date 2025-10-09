// import Game from "../classes/Game";
//
// const PIECE_TYPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'] as const;
// type PieceType = (typeof PIECE_TYPES)[number];
//
// describe("Game piece generation and queue behavior", () => {
//   test("initializes pieceQueue with exactly two 7-piece bags", () => {
//     const game = new Game("room-test");
//     expect(Array.isArray(game.pieceQueue)).toBe(true);
//     expect(game.pieceQueue.length).toBe(14);
//
//     const bag1 = game.pieceQueue.slice(0, 7);
//     const bag2 = game.pieceQueue.slice(7, 14);
//
//     // chaque sac contient exactement les 7 types, une fois chacun
//     const bag1Set = new Set(bag1);
//     const bag2Set = new Set(bag2);
//     expect(bag1.length).toBe(7);
//     expect(bag2.length).toBe(7);
//     expect(bag1Set.size).toBe(7);
//     expect(bag2Set.size).toBe(7);
//     PIECE_TYPES.forEach(t => {
//       expect(bag1Set.has(t)).toBe(true);
//       expect(bag2Set.has(t)).toBe(true);
//     });
//   });
//
//   test("takeTypes consumes from the queue and auto-refills when low", () => {
//     const game = new Game("room-test");
//     expect(game.pieceQueue.length).toBe(14);
//
//     const first = game.takeTypes(7);
//     expect(first).toHaveLength(7);
//     // 14 - 7 = 7 (pas de refill car 7 n'est pas < 7)
//     expect(game.pieceQueue.length).toBe(7);
//
//     const second = game.takeTypes(10);
//     expect(second).toHaveLength(10);
//     // Avant shift: ensureTypes remplit pour avoir >=10 (7 -> +7 => 14)
//     // Après shift 10 => 4, puis refill car < 7 => +7 => 11
//     expect(game.pieceQueue.length).toBe(11);
//   });
//
//   test("peekTypes does not consume and matches subsequent takeTypes for same N", () => {
//     const game = new Game("room-test");
//     expect(game.pieceQueue.length).toBe(14);
//
//     const peek = game.peekTypes(5);
//     expect(peek).toHaveLength(5);
//     // peek ne consomme pas
//     expect(game.pieceQueue.length).toBe(14);
//
//     const taken = game.takeTypes(5);
//     expect(taken).toEqual(peek);
//     // après la prise de 5, longueur = 9 (14 - 5)
//     expect(game.pieceQueue.length).toBe(9);
//   });
//
//   test("all returned types are valid Tetris piece types", () => {
//     const game = new Game("room-test");
//     const pulled = game.takeTypes(50); // force des refills
//     expect(pulled.length).toBe(50);
//     pulled.forEach(t => {
//       expect((PIECE_TYPES as readonly string[]).includes(t as PieceType)).toBe(true);
//     });
//   });
// });
