const { User } = require("../../../models/user");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const config = require("config");

describe("Admin Middleware", () => {
  let payload = {
    isAdmin: true,
  };
  let token;

  beforeEach(() => {
    server = require("../../../index");
    token = new User().generateAuthToken();
  });

  afterEach(() => {
    server.close();
  });

  const exec = () => {
    return;
  };

  it("should return 403 if the user is not Admin", async () => {
    const res = await request(server)
      .post("/api/items")
      .set("x-auth-token", token)
      .send({ name: "item1" });

    expect(res.status).toBe(403);
  });

  it("should pass to the next middleware if the user is Admin", () => {
    token = new User({ isAdmin: true }).generateAuthToken();

    decoded = jwt.verify(token, config.get("jwtPrivateKey"));

    expect(decoded.isAdmin).toBe(true);
  });
});
