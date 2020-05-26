const request = require("supertest");
const { User } = require("../../../models/user");
const jwt = require("jsonwebtoken");
const config = require("config");

describe("/api/auth", () => {
  beforeEach(async () => {
    server = require("../../../index");

    token = new User({ isAdmin: true }).generateAuthToken();

    await request(server).post("/api/users").set("x-auth-token", token).send({
      username: "12345",
      password: "12345",
    });
  });

  afterEach(async () => {
    await server.close();
    await User.deleteMany({});
  });

  describe("POST /", () => {
    let username;
    let password;

    const exec = () => {
      return request(server).post("/api/auth").send({ username, password });
    };

    beforeEach(() => {
      username = "12345";
      password = "12345";
    });

    it("should return 400 if the username less than 5 characters", async () => {
      username = "1234";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the username is greater than 50 characters", async () => {
      username = new Array(52).join("a");

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the password is less than 5 characters", async () => {
      password = "1234";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the password is greater than 50 characters", async () => {
      password = new Array(52).join("a");

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the username is not found", async () => {
      username = "123456";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if password is incorrect", async () => {
      password = "123456";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 200 if the user is valid", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
    });

    it("should return the token if the user is valid", async () => {
      const res = await exec();

      const decoded = jwt.verify(res.text, config.get("jwtPrivateKey"));

      expect(decoded.username).toBe(username);
    });
  });
});
