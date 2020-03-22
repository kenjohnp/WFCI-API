const express = require("express");
const { SalesOrder, validate } = require("../models/salesorder");
const { Customer } = require("../models/customer");
const { Item } = require("../models/item");
const router = express.Router();

router.get("/", async (req, res) => {
  const salesOrders = await SalesOrder.find()
    .populate("soItems.item")
    .sort("-soDate");
  res.send(salesOrders);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Customer.findById(req.body.customerId);
  if (!customer) return res.status(400).send("Invalid Customer");

  req.body.soItems.forEach(async soItem => {
    const itemId = await Item.findById(soItem.item);
    if (!itemId) return res.status(400).send("Invalid Item");
  });

  let salesOrder = new SalesOrder({
    customer: {
      _id: customer._id,
      name: customer.name
    },
    soItems: req.body.soItems,
    soRefNo: req.body.soRefNo,
    soDate: req.body.date,
    remarks: req.body.remarks
  });

  salesOrder = await salesOrder.save();
  res.send(salesOrder);
});

router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Customer.findById(req.body.customerId);
  if (!customer) return res.status(400).send("Invalid Customer");

  const salesOrder = await SalesOrder.findByIdAndUpdate(
    req.params.id,
    {
      customer: { _id: customer._id, name: customer.name },
      soItems: req.body.soItems,
      soRefNo: req.body.soRefNo,
      soDate: req.body.date,
      remarks: req.body.remarks
    },
    { new: true }
  );

  if (!salesOrder)
    return res
      .status(404)
      .send("The Sales Order with the given ID was not found.");

  res.send(salesOrder);
});

router.delete("/:id", async (req, res) => {
  const salesOrder = await SalesOrder.findByIdAndRemove(req.params.id);

  if (!salesOrder)
    return res
      .status(404)
      .send("The Sales Order with the given ID was not found.");

  res.send(salesOrder);
});

router.get("/:id", async (req, res) => {
  const salesOrder = await SalesOrder.findById(req.params.id).populate(
    "soItems.item"
  );

  if (!salesOrder)
    return res
      .status(404)
      .send("The Sales Order with the given ID was not found.");

  res.send(salesOrder);
});

module.exports = router;
