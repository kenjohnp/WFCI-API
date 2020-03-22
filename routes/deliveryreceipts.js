const express = require("express");
const { DeliveryReceipt, validate } = require("../models/deliveryreceipt");
const { Customer } = require("../models/customer");
const { Item } = require("../models/item");
const router = express.Router();

router.get("/", async (req, res) => {
  const deliveryReceipts = await DeliveryReceipt.find();
  res.send(deliveryReceipts);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Customer.findById(req.body.customerId);
  if (!customer) return res.status(400).send("Invalid Customer");

  const salesOrder = await salesOrder.findById(req.body.salesOrder);
  if (!salesOrder) return res.status(400).send("Invalid Sales Order");

  req.body.drItems.foreach(async drItem => {
    const itemId = await Item.findById(drItem.item);
    if (!itemId) return res.status(400).send("Invalid Item");
  });

  let deliveryReceipt = new DeliveryReceipt({
    customer: {
      _id: customer._id,
      name: customer.name
    },
    drItems: req.body.drItems,
    drRefNo: req.body.drRefNo,
    drDate: req.body.drDate,
    remarks: req.body.remarks,
    salesOrder: salesOrder._id
  });

  deliveryReceipt = await deliveryReceipt.save();
  res.send(deliveryReceipt);
});
