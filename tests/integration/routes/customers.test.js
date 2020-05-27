const request = require("supertest");
const mongoose = require("mongoose");
const { Customer } = require("../../../models/customer");
const { User } = require("../../../models/user");

describe("/api/customers", () => {
  let token;
  let name, contactNumber, contactPerson, address, tinNo, businessStyle;

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
          businessStyle: "a"
        },
        {
          name: "b",
          contactPerson: "b",
          contactNumber: "1",
          address: "b",
          tinNo: "b",
          businessStyle: "b"
        }
      ];

      await Customer.collection.insertMany(customers);

      const res = await request(server)
        .get("/api/customers")
        .set("x-auth-token", token);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(c => c.name === "a")).toBeTruthy();
      expect(res.body.some(c => c.name === "b")).toBeTruthy();
    });
  });

  describe("POST /", () => {
    beforeEach(() => {
      name = "a";
      contactPerson = "a";
      contactNumber = "1";
      address = "a";
      tinNo = "a";
      businessStyle = "a";
    });

    const exec = () => {
      return request(server)
        .post("/api/customers")
        .set("x-auth-token", token)
        .send({
          name,
          contactPerson,
          contactNumber,
          address,
          tinNo,
          businessStyle
        });
    };

    describe("POST / (Validation)", () => {
      it("should return 400 if name is empty", async () => {
        name = "";

        const res = await exec();

        expect(res.status).toBe(400);
      });

      it("should return 400 if name is greater than 255", async () => {
        name = new Array(257).join("a");

        const res = await exec();

        expect(res.status).toBe(400);
      });

      it("should return 400 if contactPerson is greater than 50", async () => {
        contactPerson = new Array(52).join("a");

        const res = await exec();

        expect(res.status).toBe(400);
      });

      it("should return 400 if contactNumber is greater than 20", async () => {
        contactNumber = new Array(22).join("a");

        const res = await exec();

        expect(res.status).toBe(400);
      });

      it("should return 400 if address is greater than 255", async () => {
        address = new Array(257).join("a");

        const res = await exec();

        expect(res.status).toBe(400);
      });

      it("should return 400 if tinNo is greater than 20", async () => {
        tinNo = new Array(22).join("a");

        const res = await exec();

        expect(res.status).toBe(400);
      });

      it("should return 400 if businessStyle is greater than 50", async () => {
        tinNo = new Array(52).join("a");

        const res = await exec();

        expect(res.status).toBe(400);
      });
    });

    it("should save the customer if it is valid.", async () => {
      const res = await exec();

      const customer = await Customer.find({ name });

      expect(res.status).toBe(200);
      expect(customer).not.toBeNull();
    });

    it("should return the saved customer if it is valid.", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", name);
      expect(res.body).toHaveProperty("contactPerson", contactPerson);
      expect(res.body).toHaveProperty("contactNumber", contactNumber);
      expect(res.body).toHaveProperty("address", address);
      expect(res.body).toHaveProperty("tinNo", tinNo);
      expect(res.body).toHaveProperty("businessStyle", businessStyle);
    });
  });

  describe("PUT /", () => {
    beforeEach(async () => {
      name = "b";
      contactPerson = "b";
      contactNumber = "1";
      address = "b";
      tinNo = "b";
      businessStyle = "b";

      const customer = new Customer({
        name,
        contactPerson,
        contactNumber,
        address,
        tinNo,
        businessStyle
      });

      await customer.save();

      id = customer._id;
    });

    const exec = () => {
      return request(server)
        .put("/api/customers/" + id)
        .set("x-auth-token", token)
        .send({
          name,
          contactPerson,
          contactNumber,
          address,
          tinNo,
          businessStyle
        });
    };

    it("should return 400 if the id is not valid.", async () => {
      id = "1";

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return 400 if the id is not found.", async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return 400 if the customer is not valid.", async () => {
      name = "";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should update the customer if it is valid.", async () => {
      const res = await exec();

      const customer = await Customer.findById(id);

      expect(res.status).toBe(200);
      expect(customer).not.toBeNull();
      expect(customer).toHaveProperty("name", name);
    });

    it("should return the updated customer.", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id", id.toString());
      expect(res.body).toHaveProperty("name", name);
    });
  });

  describe("DELETE /", () => {
    beforeEach(async () => {
      name = "a";
      contactPerson = "a";
      contactNumber = "1";
      address = "a";
      tinNo = "a";
      businessStyle = "a";

      const customer = new Customer({
        name,
        contactPerson,
        contactNumber,
        address,
        tinNo,
        businessStyle
      });

      await customer.save();

      id = customer._id;
    });

    const exec = () => {
      return request(server)
        .delete("/api/customers/" + id)
        .set("x-auth-token", token)
        .send();
    };

    it("should return 404 if id is not valid.", async () => {
      id = "1";

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return 404 if id is not found.", async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should delete the customer if id is valid.", async () => {
      const res = await exec();

      const customer = await Customer.findById(id);

      expect(res.status).toBe(200);
      expect(customer).toBeNull();
    });

    it("should return the deleted customer.", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id", id.toString());
      expect(res.body).toHaveProperty("name", name);
    });
  });

  describe("GET /:id", () => {
    beforeEach(async () => {
      const customer = new Customer({
        name,
        contactPerson,
        contactNumber,
        address,
        tinNo,
        businessStyle
      });

      await customer.save();

      id = customer._id;
    });

    const exec = () => {
      return request(server)
        .get("/api/customers/" + id)
        .set("x-auth-token", token)
        .send();
    };

    it("should return 404 if the id is not valid.", async () => {
      id = "1";

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return 404 if the id is not found.", async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return the customer if it is valid.", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id", id.toString());
      expect(res.body).toHaveProperty("name", name);
    });
  });
});
