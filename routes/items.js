const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const express = require("express");
const { Item, validate } = require("../models/item");
const router = express.Router();

router.get("/", async (req, res) => {
  const items = await Item.find()
    .sort("name")
    .select("-__v");
  res.send(items);
});

router.post("/", [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let item = new Item({ name: req.body.name });
  item = await item.save();

  res.send(item);
});

router.put("/:id", [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const item = await Item.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name },
    { new: true }
  );

  if (!item)
    return res.status(404).send("The item with the given ID was not found.");

  res.send(item);
});

router.delete("/:id", [auth, admin], async (req, res) => {
  const item = await Item.findByIdAndRemove(req.params.id);

  if (!item)
    return res.status(404).send("The item with the given ID was not found.");

  res.send(item);
});

router.get("/:id", auth, async (req, res) => {
  const item = await Item.findById(req.params.id);

  if (!item)
    return res.status(404).send("The item with the given ID was not found.");

  res.send(item);
});

module.exports = router;
