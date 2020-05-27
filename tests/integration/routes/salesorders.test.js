const { Item } = require("../../../models/item");
const { SalesOrder } = require("../../../models/salesorder");
const { User } = require("../../../models/user");
const { Customer } = require("../../../models/customer");
const request = require("supertest");
const mongoose = require("mongoose");

describe("/api/salesorders", () => {
  let token;

  beforeEach(() => {
    server = require("../../../index");
    token = new User({ isAdmin: true }).generateAuthToken();
  });

  afterEach(async () => {
    await server.close();
    await User.deleteMany();
    await Item.deleteMany();
    await Customer.deleteMany();
    await SalesOrder.deleteMany();
  });

  describe("GET /", () => {
    let filter;

    const exec = () => {
      return request(server)
        .get("/api/salesorders?filter=" + filter)
        .set("x-auth-token", token);
    };

    beforeEach(async () => {
      let items = [{ name: "item1" }, { name: "item2" }];

      items = await Item.collection.insertMany(items);

      const salesOrders = [
        {
          customer: { name: "a" },
          soItems: [
            {
              item: {
                name: items.ops[0].name,
                id: items.ops[0]._id,
              },
              qty: 1,
              price: 1,
            },
            {
              item: {
                name: items.ops[1].name,
                id: items.ops[1]._id,
              },
              qty: 1,
              price: 1,
            },
          ],
          soRefNo: "1",
          soDate: "2020-27-05",
          remarks: "a",
        },
        {
          customer: { name: "b" },
          soItems: [
            {
              item: {
                name: "item1",
                id: "a",
              },
            },
            {
              item: {
                name: "item2",
                id: "b",
              },
            },
          ],
          soRefNo: "1",
          soDate: "2020-27-05",
          remarks: "b",
        },
      ];

      await SalesOrder.collection.insertMany(salesOrders);
    });

    it("should get all Sales Orders with getCustomers filter", async () => {
      filter = "getCustomers";

      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((s) => s.customer.name === "a")).toBeTruthy();
      expect(res.body.some((s) => s.customer.name === "b")).toBeTruthy();
    });

    it("should get all Sales Orders with getSOItems filter", async () => {
      filter = "getSOItems";

      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.customer).toBe(undefined);
    });

    it("should get all Sales Orders without filter", async () => {
      filter = "";

      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((s) => s.customer.name === "a")).toBeTruthy();
      expect(res.body.some((s) => s.customer.name === "b")).toBeTruthy();
    });
  });

  describe("POST /", () => {
    let customerId, soItems, soRefNo, soDate, remarks;

    beforeEach(async () => {
      const customer = new Customer({ name: "a" });

      await customer.save();

      const items = new Item({ name: "a" });

      await items.save();

      customerId = customer._id;
      soItems = [
        {
          item: {
            name: items.name,
            id: items._id,
          },
          qty: 1,
          price: 1,
        },
      ];
      soRefNo = "1";
      soDate = "2020-05-27";
      remarks = "a";
    });

    const exec = () => {
      return request(server)
        .post("/api/salesorders")
        .set("x-auth-token", token)
        .send({ customerId, soItems, soRefNo, soDate, remarks });
    };

    it("should return 400 if the customerId is not a valid objectID.", async () => {
      customerId = "1";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the soItems is empty", async () => {
      soItems = "";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the soItems is empty", async () => {
      soRefNo = "";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the soDate is not a Date", async () => {
      soDate = "";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the soRefNo is empty", async () => {
      soRefNo = "";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the soRefNo is greater than 10 characters", async () => {
      soRefNo = new Array(12).join("1");

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the remarks is greater than 500", async () => {
      remarks = new Array(502).join("a");

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 404 if the customer is not found.", async () => {
      customerId = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return 400 if the soRefNo already exists", async () => {
      await exec();

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the item is invalid", async () => {
      soItems[0].item = {
        id: mongoose.Types.ObjectId(),
        name: "a",
      };

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should save the salesOrder if it is valid.", async () => {
      const res = await exec();

      const soInDb = await SalesOrder.findById(res.body._id);

      expect(res.status).toBe(200);
      expect(soInDb).not.toBeNull();
    });

    it("should return the saved salesOrder.", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("customer");
      expect(res.body).toHaveProperty("soRefNo");
    });
  });

  describe("PUT /", () => {
    let id, customerId, soItems, soRefNo, soDate, remarks;

    beforeEach(async () => {
      const customer = new Customer({ name: "a" });

      await customer.save();

      const items = new Item({ name: "a" });

      await items.save();

      customerId = customer._id;

      soItems = [
        {
          item: {
            name: items.name,
            id: items._id,
          },
          qty: 1,
          price: 1,
        },
      ];
      soRefNo = "1";
      soDate = "2020-05-27";
      remarks = "a";

      const salesOrder = await request(server)
        .post("/api/salesorders")
        .set("x-auth-token", token)
        .send({ customerId, soItems, soRefNo, soDate, remarks });

      id = salesOrder.body._id;

      soRefNo = "2";
      soDate = "2020-05-28";
      remarks = "b";
    });

    const exec = () => {
      return request(server)
        .put("/api/salesorders/" + id)
        .set("x-auth-token", token)
        .send({ customerId, soItems, soRefNo, soDate, remarks });
    };

    it("should return 404 if Sales Order id is not valid.", async () => {
      id = "1";

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return 404 if Sales Order id is not found", async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return 404 if customerId is not valid.", async () => {
      customerId = "1";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 404 if customerId not found.", async () => {
      customerId = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return 400 if SO Ref No already exists.", async () => {
      soRefNo = "1";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should update the sales order if it is valid.", async () => {
      const res = await exec();

      const salesOrder = await SalesOrder.findById(id);

      expect(res.status).toBe(200);
      expect(salesOrder).not.toBeNull();
      expect(salesOrder).toHaveProperty("_id");
      expect(salesOrder).toHaveProperty("remarks", remarks);
    });

    it("should return the updated sales order.", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("remarks");
    });
  });

  describe("DELETE /", () => {
    let id, customerId, soItems, soRefNo, soDate, remarks;

    beforeEach(async () => {
      const customer = new Customer({ name: "a" });

      await customer.save();

      const items = new Item({ name: "a" });

      await items.save();

      customerId = customer._id;
      soItems = [
        {
          item: {
            name: items.name,
            id: items._id,
          },
          qty: 1,
          price: 1,
        },
      ];
      soRefNo = "1";
      soDate = "2020-05-27";
      remarks = "a";

      const salesOrder = await request(server)
        .post("/api/salesorders")
        .set("x-auth-token", token)
        .send({ customerId, soItems, soRefNo, soDate, remarks });

      id = salesOrder.body._id;
    });

    const exec = () => {
      return request(server)
        .delete("/api/salesorders/" + id)
        .set("x-auth-token", token);
    };

    it("should return 404 if id is not valid.", async () => {
      id = "1";

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return 404 if sales order not found", async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should delete the sales order if it is valid.", async () => {
      const res = await exec();

      const soInDb = await SalesOrder.findById(id);

      expect(res.status).toBe(200);
      expect(soInDb).toBeNull();
    });

    it("should return the deleted sales order", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("customer");
    });
  });

  describe("GET /:id", () => {
    let id, customerId, soItems, soRefNo, soDate, remarks, filter;

    beforeEach(async () => {
      const customer = new Customer({ name: "a" });

      await customer.save();

      const items = new Item({ name: "a" });

      await items.save();

      customerId = customer._id;

      soItems = [
        {
          item: {
            name: items.name,
            id: items._id,
          },
          qty: 1,
          price: 1,
        },
      ];
      soRefNo = "1";
      soDate = "2020-05-27";
      remarks = "a";

      const salesOrder = await request(server)
        .post("/api/salesorders")
        .set("x-auth-token", token)
        .send({ customerId, soItems, soRefNo, soDate, remarks });

      id = salesOrder.body._id;
    });

    const exec = () => {
      return request(server)
        .get(`/api/salesorders/${id}?filter=${filter}`)
        .set("x-auth-token", token);
    };

    it("should return 404 if the id is not valid.", async () => {
      id = "1";

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return 404 if the sales order not found", async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return sales order with getSOItems filter", async () => {
      filter = "getSOItems";

      const res = await exec();

      console.log(res.body);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body.soItems[0]).toHaveProperty("item");
      expect(res.body.soItems[0]).toHaveProperty("qty");
    });

    it("should return sales order without filter", async () => {
      filter = "";

      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("customer");
      expect(res.body).toHaveProperty("soRefNo");
    });
  });
});
