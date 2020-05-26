const request = require("supertest");
const mongoose = require("mongoose");
const { Customer } = require("../../../models/customer");
const { User } = require("../../../models/user");

describe("/api/customers", () => {
  let token;

  beforeEach(() => {
    server = require("../../../index");
    token = new User({ isAdmin: true }).generateAuthToken();
  });

  afterEach(async () => {
    await server.close();
    await User.deleteMany();
    await Customer.deleteMany();
  });

  describe("GET /", () => {
    it("should get all customers", async () => {
      const customers = [
        {
          name: "a",
          contactPerson: "a",
          contactNumber: "1",
          address: "a",
          tinNo: "a",
          businessStyle: "a",
        },
        {
          name: "b",
          contactPerson: "b",
          contactNumber: "1",
          address: "b",
          tinNo: "b",
          businessStyle: "b",
        },
      ];

      await Customer.collection.insertMany(customers);

      const res = await request(server)
        .get("/api/customers")
        .set("x-auth-token", token);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((c) => c.name === "a")).toBeTruthy();
      expect(res.body.some((c) => c.name === "b")).toBeTruthy();
    });
  });
});
