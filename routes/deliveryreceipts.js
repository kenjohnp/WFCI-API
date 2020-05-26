const auth = require("../middleware/auth");
const { DeliveryReceipt, validate } = require("../models/deliveryReceipt");
const { Customer } = require("../models/customer");
const { Item } = require("../models/item");
const { SalesOrder } = require("../models/salesOrder");
const express = require("express");
const router = express.Router();

router.get("/", auth, async (req, res) => {
  const deliveryReceipts = await DeliveryReceipt.find()
    .populate("drItems.item salesOrder", "soRefNo name")
    .sort("-drDate");
  res.send(deliveryReceipts);
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Customer.findById(req.body.customerId);
  if (!customer) return res.status(400).send("Invalid Customer");

  const salesOrder = await SalesOrder.findById(req.body.salesOrder);
  if (!salesOrder) return res.status(400).send("Invalid Sales Order");

  const checkExistingDR = await DeliveryReceipt.findOne({
    drRefNo: req.body.drRefNo,
  });

  if (checkExistingDR) return res.status(400).send("DR already exists");

  req.body.drItems.forEach(async (drItem) => {
    const itemId = await Item.findById(drItem.item.value);
    if (!itemId) return res.status(400).send("Invalid Item");
  });

  let deliveryReceipt = new DeliveryReceipt({
    customer: {
      _id: customer._id,
      name: customer.name,
    },
    drItems: req.body.drItems,
    drRefNo: req.body.drRefNo,
    drDate: req.body.drDate,
    remarks: req.body.remarks,
    salesOrder: salesOrder._id,
  });

  deliveryReceipt = await deliveryReceipt.save();
  res.send(deliveryReceipt);
});

router.put("/:id", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Customer.findById(req.body.customerId);
  if (!customer) return res.status(400).send("Invalid Customer");

  const salesOrder = await SalesOrder.findById(req.body.salesOrder);
  if (!salesOrder) return res.status(400).send("Invalid Sales Order");

  req.body.drItems.forEach(async (drItem) => {
    const itemId = await Item.findById(drItem.item);
    if (!itemId) return res.status(400).send("Invalid Item");
  });

  const deliveryReceipt = await DeliveryReceipt.findByIdAndUpdate(
    req.params.id,
    {
      customer: {
        _id: customer._id,
        name: customer.name,
      },
      drItems: req.body.drItems,
      drRefNo: req.body.drRefNo,
      drDate: req.body.drDate,
      remarks: req.body.remarks,
      salesOrder: salesOrder._id,
    },
    { new: true }
  );

  if (!deliveryReceipt)
    return res
      .status(404)
      .send("The Delivery Receipt with the given ID was not found.");

  res.send(deliveryReceipt);
});

router.delete("/:id", auth, async (req, res) => {
  const deliveryReceipt = await DeliveryReceipt.findByIdAndRemove(
    req.params.id
  );

  if (!deliveryReceipt)
    return res
      .status(404)
      .send("The Delivery Receipt with the given ID was not found.");

  res.send(deliveryReceipt);
});

router.get("/:id", auth, async (req, res) => {
  const deliveryReceipt = await DeliveryReceipt.findById(
    req.params.id
  ).populate("drItems.item salesOrder", "soRefNo name");

  if (!deliveryReceipt)
    return res
      .status(404)
      .send("The Delivery Receipt with the given ID was not found.");

  res.send(deliveryReceipt);
});

module.exports = router;
