import request from "supertest";
import app from "../app";

describe("GET /test", () => {
  it("should return test recu", async () => {
    const res = await request(app).get("/test");
    expect(res.status).toBe(200);
    expect(res.text).toEqual("test recu");
  });
});
