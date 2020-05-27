const Joi = require("@hapi/joi");
const mongoose = require("mongoose");

const salesOrderItemsSchema = new mongoose.Schema({
  item: {
    type: new mongoose.Schema({
      name: {
        type: String,
        required: true,
        maxLength: 255,
      },
      id: {
        type: mongoose.Types.ObjectId,
        required: true,
      },
    }),
    required: true,
  },
  qty: { type: Number, min: 0, required: true },
  price: { type: Number, min: 0 },
});

const salesOrderSchema = new mongoose.Schema({
  customer: {
    type: new mongoose.Schema({
      name: {
        type: String,
        required: true,
        maxLength: 255,
      },
    }),
    required: true,
  },
  soItems: [salesOrderItemsSchema],
  soRefNo: {
    type: String,
    required: true,
    maxlength: 10,
  },
  soDate: {
    type: Date,
    require: true,
  },
  remarks: {
    type: String,
    maxlength: 500,
  },
  dateModified: {
    type: Date,
    default: Date.now,
  },
});

const SalesOrder = mongoose.model("SalesOrder", salesOrderSchema);

function validateSalesOrder(salesOrder) {
  const schema = Joi.object({
    customerId: Joi.objectId().required(),
    soItems: Joi.array().items(
      Joi.object({
        item: Joi.object({
          name: Joi.string().max(255).required(),
          id: Joi.objectId().max(255).required(),
        }),
        qty: Joi.number().min(0).required(),
        price: Joi.number().min(0).required(),
      })
    ),
    soRefNo: Joi.string().max(10).required(),
    soDate: Joi.date().required(),
    remarks: Joi.string().max(500),
  });

  return schema.validate(salesOrder, { allowUnknown: true });
}

exports.SalesOrder = SalesOrder;
exports.validateSalesOrder = validateSalesOrder;
