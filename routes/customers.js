const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const express = require("express");
const { Customer, validate } = require("../models/customer");
const router = express.Router();

router.get("/", [auth], async (req, res) => {
  const customers = await Customer.find().sort("name").select("-__v");
  res.send(customers);
});

router.post("/", [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let customer = new Customer({
    name: req.body.name,
    contactPerson: req.body.contactPerson,
    contactNumber: req.body.contactNumber,
    address: req.body.address,
    tinNo: req.body.tinNo,
    businessStyle: req.body.businessStyle,
  });

  customer = await customer.save();

  res.send(customer);
});

router.put("/:id", [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      contactPerson: req.body.contactPerson,
      contactNumber: req.body.contactNumber,
      address: req.body.address,
      tinNo: req.body.tinNo,
      businessStyle: req.body.businessStyle,
    },
    { new: true }
  );

  if (!customer)
    return res
      .status(404)
      .send("The customer with the given ID was not found.");

  res.send(customer);
});

router.delete("/:id", [auth, admin], async (req, res) => {
  const customer = await Customer.findByIdAndRemove(req.params.id);

  if (!customer)
    return res
      .status(404)
      .send("The customer with the given ID was not found.");

  res.send(customer);
});

router.get("/:id", [auth], async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer)
    return res
      .status(404)
      .send("The customer with the given ID was not found.");
  res.send(customer);
});

module.exports = router;
