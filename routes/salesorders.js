const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validate = require("../middleware/validate");
const validateObjectId = require("../middleware/validateObjectId");
const { SalesOrder, validateSalesOrder } = require("../models/salesOrder");
const { Customer } = require("../models/customer");
const { Item } = require("../models/item");
const express = require("express");
const router = express.Router();

router.get("/", auth, async (req, res) => {
  let selectFields = {};
  switch (req.query.filter) {
    case "getCustomers":
      selectFields = {
        _id: 1,
        customer: 1,
        soRefNo: 1,
        soDate: 1,
      };
      break;
    case "getSOItems":
      selectFields = {
        _id: 1,
        soItems: 1,
        soDate: 1,
      };
      break;
    default:
      break;
  }

  const salesOrders = await SalesOrder.find()
    .sort("-soDate")
    .select(selectFields);

  res.send(salesOrders);
});

router.post("/", [auth, validate(validateSalesOrder)], async (req, res) => {
  const customer = await Customer.findById(req.body.customerId);
  if (!customer) return res.status(404).send("Invalid Customer");

  const checkExistingSO = await SalesOrder.findOne({
    soRefNo: req.body.soRefNo,
  });
  if (checkExistingSO) return res.status(400).send("SO Ref No Already Exists");

  let item;

  let itemsNotFound = 0;
  for (let i = 0; i < req.body.soItems.length; i++) {
    item = await Item.findById(req.body.soItems[i].item.id);
    if (!item) itemsNotFound++;
  }

  if (itemsNotFound > 0) return res.status(400).send("Invalid Item");

  let salesOrder = new SalesOrder({
    customer: {
      _id: customer._id,
      name: customer.name,
    },
    soItems: req.body.soItems,
    soRefNo: req.body.soRefNo,
    soDate: req.body.soDate,
    remarks: req.body.remarks,
  });

  salesOrder = await salesOrder.save();

  res.send(salesOrder);
});

router.put(
  "/:id",
  [auth, validateObjectId, validate(validateSalesOrder)],
  async (req, res) => {
    const customer = await Customer.findById(req.body.customerId);
    if (!customer) return res.status(404).send("Invalid Customer");

    const checkExistingSO = await SalesOrder.findOne({
      soRefNo: req.body.soRefNo,
    });

    if (checkExistingSO)
      return res.status(400).send("SO Ref No Already Exists");

    const salesOrder = await SalesOrder.findByIdAndUpdate(
      req.params.id,
      {
        customer: { _id: customer._id, name: customer.name },
        soItems: req.body.soItems,
        soRefNo: req.body.soRefNo,
        soDate: req.body.soDate,
        remarks: req.body.remarks,
      },
      { new: true }
    );

    if (!salesOrder)
      return res
        .status(404)
        .send("The Sales Order with the given ID was not found.");

    res.send(salesOrder);
  }
);

router.delete("/:id", [auth, validateObjectId], async (req, res) => {
  const salesOrder = await SalesOrder.findByIdAndRemove(req.params.id);

  if (!salesOrder)
    return res
      .status(404)
      .send("The Sales Order with the given ID was not found.");

  res.send(salesOrder);
});

router.get("/:id", [auth, validateObjectId], async (req, res) => {
  let selectFields = {};

  if (req.query.filter === "getSOItems")
    selectFields =
      "_id soItems.item soItems.qty soItems.item.name soItems.item.id";

  const salesOrder = await SalesOrder.findById(req.params.id, selectFields);

  if (!salesOrder)
    return res
      .status(404)
      .send("The Sales Order with the given ID was not found.");

  res.send(salesOrder);
});

module.exports = router;
