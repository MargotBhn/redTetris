import Player from "../classes/Player";

describe("Player class", () => {
  test("initializes core properties", () => {
    const pl = new Player("Alice", "socket-1", true);
    expect(pl.name).toBe("Alice");
    expect(pl.socketId).toBe("socket-1");
    expect(pl.isLeader).toBe(true);
    expect(pl.isAlive).toBe(true);
    expect(pl.pieceIndex).toBe(0);
  });

  test("initializes a 20x10 board filled with zeros", () => {
    const pl = new Player("Bob", "socket-2", false);
    expect(Array.isArray(pl.board)).toBe(true);
    expect(pl.board.length).toBe(20);
    for (const row of pl.board) {
      expect(Array.isArray(row)).toBe(true);
      expect(row.length).toBe(10);
      for (const cell of row) {
        expect(cell).toBe(0);
      }
    }
  });
});
