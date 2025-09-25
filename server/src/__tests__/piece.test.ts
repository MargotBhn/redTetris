import Piece, { PieceType } from "../classes/Piece";

const PIECE_TYPES: ReadonlyArray<PieceType> = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'] as const;

describe("Piece class", () => {
  test("constructs with an explicit type", () => {
    const p = new Piece('T');
    expect(p.type).toBe('T');
  });

  test("default constructor generates a valid type", () => {
    const p = new Piece();
    expect(PIECE_TYPES.includes(p.type)).toBe(true);
  });

  test("types mapping contains exactly the 7 canonical types", () => {
    const p = new Piece('I'); // type choisi arbitrairement
    const keys = Object.keys(p.types).sort();
    expect(keys).toEqual([...PIECE_TYPES].sort());
  });

  test("random generation over multiple instances only yields valid types", () => {
    const draws = new Set<PieceType>();
    for (let i = 0; i < 200; i++) {
      draws.add(new Piece().type);
    }
    // Sous-ensemble des types attendus
    for (const t of draws) {
      expect(PIECE_TYPES.includes(t)).toBe(true);
    }
    // En pratique, sur 200 tirages, on devrait voir plusieurs types
    expect(draws.size).toBeGreaterThanOrEqual(3);
  });
});
