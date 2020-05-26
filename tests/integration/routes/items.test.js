const request = require("supertest");
const { Item } = require("../../../models/item");
const { User } = require("../../../models/user");
const mongoose = require("mongoose");

describe("/api/items", () => {
  beforeEach(async () => {
    server = require("../../../index");

    token = new User({ isAdmin: true }).generateAuthToken();
  });

  afterEach(async () => {
    await server.close();
    await Item.deleteMany();
    await User.deleteMany();
  });

  describe("GET /", () => {
    it("should return all items", async () => {
      const items = [{ name: "Item1" }, { name: "Item2" }, { name: "Item3" }];
      await Item.collection.insertMany(items);

      const res = await request(server)
        .get("/api/items")
        .set("x-auth-token", token)
        .send();

      expect(res.status).toBe(200);
      expect(res.body.some((i) => i.name === "Item1")).toBeTruthy();
      expect(res.body.some((i) => i.name === "Item2")).toBeTruthy();
      expect(res.body.some((i) => i.name === "Item3")).toBeTruthy();
    });
  });

  describe("POST /", () => {
    let name;

    beforeEach(() => {
      name = "a";
    });

    const exec = () => {
      return request(server)
        .post("/api/items")
        .set("x-auth-token", token)
        .send({ name });
    };

    it("should return 400 if name is empty or null.", async () => {
      name = "";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if name is greater than 255 characters", async () => {
      name = new Array(257).join("a");

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should save the item if item is valid.", async () => {
      await exec();

      const user = await User.find({ name });

      expect(user).not.toBeNull();
    });

    it("should return the item if it is valid.", async () => {
      const res = await exec();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", name);
    });
  });

  describe("PUT /", () => {
    let name;
    let id;

    beforeEach(async () => {
      const item = new Item({ name: "a" });
      await item.save();

      id = item._id;
      name = "b";
    });

    const exec = () => {
      return request(server)
        .put("/api/items/" + id)
        .set("x-auth-token", token)
        .send({ name });
    };

    it("should return 404 if id is invalid.", async () => {
      id = "1";

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return 400 if name is empty or null", async () => {
      name = "";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 404 if the item with the given ID was not found", async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should update the item if id is valid", async () => {
      const res = await exec();

      const item = await Item.findById(id);

      expect(res.status).toBe(200);
      expect(item).not.toBeNull();
      expect(item).toHaveProperty("name", name);
    });

    it("should return the updated item", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id", id.toString());
      expect(res.body).toHaveProperty("name", name);
    });
  });

  describe("DELETE /", () => {
    let id;

    beforeEach(async () => {
      const item = new Item({ name: "a" });
      await item.save();

      id = item._id;
    });

    const exec = () => {
      return request(server)
        .delete("/api/items/" + id)
        .set("x-auth-token", token)
        .send();
    };

    it("should return 404 if id is invalid.", async () => {
      id = "1";

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return 404 if the item with the given ID was not found", async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should delete the item if the id is valid.", async () => {
      const res = await exec();

      const itemInDb = await Item.findById(id);

      expect(res.status).toBe(200);
      expect(itemInDb).toBeNull();
    });
  });

  describe("GET /:id", () => {
    let id;
    let name;

    beforeEach(async () => {
      name = "a";
      const item = new Item({ name });
      await item.save();

      id = item._id;
    });

    const exec = () => {
      return request(server)
        .get("/api/items/" + id)
        .set("x-auth-token", token)
        .send();
    };

    it("should return 404 if the id is not valid.", async () => {
      id = "1";

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return 404 if the item with the given ID was not found", async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return the item if id is valid.", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id", id.toString());
      expect(res.body).toHaveProperty("name", name);
    });
  });
});
