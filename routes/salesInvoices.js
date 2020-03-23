const auth = require("../middleware/auth");
const express = require("express");
const { SalesInvoice, validate } = require("../models/salesInvoice");
const { Customer } = require("../models/customer");
const { Item } = require("../models/item");
const router = express.Router();

router.get("/", async (req, res) => {
  const salesInvoice = await SalesInvoice.find()
    .populate("salesOrder.customer siItems.item")
    .sort("-siDate");
  res.send(salesInvoice);
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) res.status(400).send(error.details[0].message);

  const customer = await Customer.findById(req.body.salesOrder.customer);
  if (!customer) return res.status(400).send("Invalid Customer");

  req.body.siItems.forEach(async siItem => {
    const itemId = await Item.findById(siItem.item);
    if (!itemId) return res.status(400).send("Invalid Item");
  });

  let salesInvoice = new SalesInvoice({
    siDate: req.body.siDate,
    salesOrder: {
      soRefNo: req.body.salesOrder.soRefNo,
      customer: customer._id
    },
    siRefNo: req.body.siRefNo,
    remarks: req.body.remarks,
    terms: req.body.terms,
    siItems: req.body.siItems
  });

  salesInvoice = await salesInvoice.save();

  res.send(salesInvoice);
});

router.put("/:id", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) res.status(400).send(error.details[0].message);

  const customer = await Customer.findById(req.body.salesOrder.customer);
  if (!customer) return res.status(400).send("Invalid Customer");

  req.body.siItems.forEach(async siItem => {
    const itemId = await Item.findById(siItem.item);
    if (!itemId) return res.status(400).send("Invalid Item");
  });

  const salesInvoice = await SalesInvoice.findByIdAndUpdate(req.params.id, {
    siDate: req.body.siDate,
    salesOrder: {
      soRefNo: req.body.salesOrder.soRefNo,
      customer: customer._id
    },
    siRefNo: req.body.siRefNo,
    remarks: req.body.remarks,
    terms: req.body.terms,
    siItems: req.body.siItems
  });

  if (!salesInvoice)
    return res
      .status(404)
      .send("The Sales Invoice with the given ID was not found.");

  res.send(salesInvoice);
});

router.delete("/:id", auth, async (req, res) => {
  const salesInvoice = await SalesInvoice.findByIdAndRemove(req.params.id);
  if (!salesInvoice)
    return res
      .status(404)
      .send("The Sales Invoice with the given ID was not found.");

  res.send(salesInvoice);
});

router.get("/:id", auth, async (req, res) => {
  const salesInvoice = await SalesInvoice.findById(req.params.id).populate(
    "salesOrder.customer siItems.item"
  );
  if (!salesInvoice)
    return res
      .status(404)
      .send("The Sales Invoice with the given ID was not found.");

  res.send(salesInvoice);
});

module.exports = router;
