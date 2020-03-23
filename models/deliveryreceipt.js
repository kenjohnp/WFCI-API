const Joi = require("@hapi/joi");
const mongoose = require("mongoose");

const drItemsSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true
  },
  qty: { type: Number, min: 0, required: true }
});

const deliveryReceiptSchema = new mongoose.Schema({
  customer: {
    type: new mongoose.Schema({
      name: {
        type: String,
        required: true,
        maxlength: 255
      }
    }),
    required: true
  },
  drItems: [drItemsSchema],
  drRefNo: {
    type: String,
    required: true,
    maxlength: 10
  },
  drDate: {
    type: Date,
    required: true
  },
  remarks: {
    type: String,
    maxlength: 500
  },
  salesOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SalesOrder"
  },
  dateModified: {
    type: Date,
    default: Date.now
  }
});

const DeliveryReceipt = mongoose.model(
  "DeliveryReceipt",
  deliveryReceiptSchema
);

function validateDeliveryReceipt(deliveryReceipt) {
  const schema = Joi.object({
    customerId: Joi.objectId().required(),
    salesOrder: Joi.objectId().required(),
    drItems: Joi.array().items(
      Joi.object({
        item: Joi.objectId().required(),
        qty: Joi.number()
          .min(0)
          .required()
      })
    ),
    drRefNo: Joi.string()
      .max(10)
      .required(),
    drDate: Joi.date().required(),
    remarks: Joi.string().max(500)
  });
  return schema.validate(deliveryReceipt);
}

exports.DeliveryReceipt = DeliveryReceipt;
exports.validate = validateDeliveryReceipt;
