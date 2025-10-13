import Player from "../classes/Player";

describe("Player class", () => {
    test("initializes core properties", () => {
        const pl = new Player("Alice", "socket-1", true);
        expect(pl.name).toBe("Alice");
        expect(pl.socketId).toBe("socket-1");
        expect(pl.isLeader).toBe(true);
        expect(pl.isAlive).toBe(true);
        expect(pl.bagIndex).toBe(0);
    });


});
