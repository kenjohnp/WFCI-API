const { User } = require("../../../models/user");
const request = require("supertest");

describe("Auth Middleware", () => {
  let token;

  beforeEach(() => {
    server = require("../../../index");
    token = new User({
      isAdmin: true,
    }).generateAuthToken();
  });

  afterEach(async () => {
    await server.close();
  });

  const exec = () => {
    return request(server)
      .post("/api/items")
      .set("x-auth-token", token)
      .send({ name: "item1" });
  };

  it("should return 401 if token is not provided", async () => {
    token = "";

    const res = await exec();

    expect(res.status).toBe(401);
  });

  it("should return 400 if token is invalid.", async () => {
    token = "a";

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it("should return 200 if token is valid", async () => {
    const res = await exec();

    expect(res.status).toBe(200);
  });
});
