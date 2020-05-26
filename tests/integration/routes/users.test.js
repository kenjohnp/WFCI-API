const request = require("supertest");
const { User } = require("../../../models/user");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

describe("Users Route", () => {
  let token;
  beforeEach(async () => {
    server = require("../../../index");

    const user = new User({
      username: "12345",
      password: "12345",
      isAdmin: true,
    });

    await user.save();

    token = user.generateAuthToken();
  });

  afterEach(async () => {
    await server.close();
    await User.deleteMany({});
  });

  describe("GET /", () => {
    it("should return all the users", async () => {
      const users = [
        {
          username: "user1",
          password: "user1",
          isAdmin: true,
        },
        {
          username: "user2",
          password: "user2",
          isAdmin: false,
        },
      ];

      await User.collection.insertMany(users);

      const res = await request(server)
        .get("/api/users")
        .set("x-auth-token", token);

      expect(res.status).toBe(200);
      expect(res.body.some((u) => u.username === "user1")).toBeTruthy();
      expect(res.body.some((u) => u.username === "user2")).toBeTruthy();
    });
  });

  describe("POST /", () => {
    let username;
    let password;
    let isAdmin;

    const exec = () => {
      return request(server)
        .post("/api/users")
        .set("x-auth-token", token)
        .send({ username, password, isAdmin });
    };

    beforeEach(() => {
      username = "username1";
      password = "password1";
    });

    it("should return 400 if username is less than 5 characters", async () => {
      username = "1234";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if password is less than 5 characters", async () => {
      password = "1234";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if username is greater than 50 characters", async () => {
      username = new Array(52).join("a");

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if password is greater than 50 characters", async () => {
      password = new Array(52).join("a");

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if user is already registered.", async () => {
      username = "12345";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should save the user if it is valid", async () => {
      await exec();

      const user = await User.find({ username, password });

      expect(user).not.toBeNull();
    });

    it("should return the user if it is valid", async () => {
      username = "username1";
      password = "password1";

      const res = await exec();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("username", username);
    });
  });

  describe("PUT /:id", () => {
    let username;
    let password;
    let isAdmin = false;
    let id;

    const exec = () => {
      return request(server)
        .put("/api/users/" + id)
        .set("x-auth-token", token)
        .send({ username, password, isAdmin });
    };

    beforeEach(async () => {
      const user = await request(server)
        .post("/api/users")
        .set("x-auth-token", token)
        .send({ username: "username1", password: "password1", isAdmin: true });

      id = user.body._id;
      username = user.body.username;
      password = "12345";
    });

    it("should return 404 if the id is invalid.", async () => {
      id = "1";
      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return 400 if the password is less than 5 characters", async () => {
      password = "1";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the password is greater than 50 characters", async () => {
      password = new Array(52).join("a");

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 404 if the user with the given id was not found", async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should update the user if it is valid", async () => {
      const res = await exec();

      const updatedUser = await User.findById(id);

      const validPassword = await bcrypt.compare(
        password,
        updatedUser.password
      );

      expect(res.status).toBe(200);
      expect(validPassword).toBe(true);
    });

    it("should return the user if it is valid", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id", id);
      expect(res.body).toHaveProperty("username", username);
    });
  });

  describe("DELETE /", () => {
    let id;
    let username;

    const exec = () => {
      return request(server)
        .delete("/api/users/" + id)
        .set("x-auth-token", token)
        .send();
    };

    beforeEach(async () => {
      const res = await request(server)
        .post("/api/users")
        .set("x-auth-token", token)
        .send({
          username: "username1",
          password: "password1",
          isAdmin: true,
        });

      id = res.body._id;
      username = res.body.username;
    });

    it("should return 401 if the user is not logged in", async () => {
      token = "";

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 403 if the user is not an admin", async () => {
      token = new User({ isAdmin: false }).generateAuthToken();

      const res = await exec();

      expect(res.status).toBe(403);
    });

    it("should return 400 if the id is invalid.", async () => {
      id = 1;

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return 404 if the user with the given id was not found", async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should delete the user if the id is valid.", async () => {
      const res = await exec();

      const userInDb = await User.findById(id);

      expect(userInDb).toBeNull();
    });

    it("should return the deleted user", async () => {
      const res = await exec();

      expect(res.body).toHaveProperty("_id", id);
      expect(res.body).toHaveProperty("username", username);
    });
  });
});
