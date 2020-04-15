const auth = require("../middleware/auth");
const { SalesOrder, validate } = require("../models/salesOrder");
const { Customer } = require("../models/customer");
const { Item } = require("../models/item");
const express = require("express");
const router = express.Router();

router.get("/", auth, async (req, res) => {
  const salesOrders = await SalesOrder.find().sort("-soDate");
  res.send(salesOrders);
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Customer.findById(req.body.customerId);
  if (!customer) return res.status(400).send("Invalid Customer");

  req.body.soItems.forEach(async (soItem) => {
    const itemId = await Item.findById(soItem.item.value);
    if (!itemId) return res.status(400).send("Invalid Item");
  });

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

router.put("/:id", auth, async (req, res) => {
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
});

router.delete("/:id", auth, async (req, res) => {
  const salesOrder = await SalesOrder.findByIdAndRemove(req.params.id);

  if (!salesOrder)
    return res
      .status(404)
      .send("The Sales Order with the given ID was not found.");

  res.send(salesOrder);
});

router.get("/:id", auth, async (req, res) => {
  const salesOrder = await SalesOrder.findById(req.params.id);

  if (!salesOrder)
    return res
      .status(404)
      .send("The Sales Order with the given ID was not found.");

  res.send(salesOrder);
});

module.exports = router;
