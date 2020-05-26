const Joi = require("@hapi/joi");
const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxLength: 255,
  },
});

const Item = mongoose.model("Item", itemSchema);

function validateItem(item) {
  const schema = Joi.object({
    name: Joi.string().max(255).required(),
  });

  return schema.validate(item);
}

exports.itemSchema = itemSchema;
exports.Item = Item;
exports.validate = validateItem;
