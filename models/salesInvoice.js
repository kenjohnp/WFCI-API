const Joi = require("@hapi/joi");
const mongoose = require("mongoose");

const salesInvoiceItemsSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true
  },
  qty: { type: Number, min: 0, required: true },
  price: { type: Number, min: 0 }
});

const salesInvoiceSchema = new mongoose.Schema({
  siDate: { type: Date, required: true },
  salesOrder: {
    type: new mongoose.Schema({
      soRefNo: {
        type: String,
        require: true,
        maxlength: 10
      },
      customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer"
      }
    }),
    required: true
  },
  siRefNo: {
    type: String,
    maxlength: 10,
    required: true
  },
  remarks: {
    type: String,
    maxlength: 500
  },
  terms: {
    type: String,
    maxlength: 20
  },
  siItems: [salesInvoiceItemsSchema],
  dateModified: {
    type: Date,
    default: Date.now
  }
});

const SalesInvoice = mongoose.model("SalesInvoice", salesInvoiceSchema);

function validateSalesInvoice(salesInvoice) {
  const schema = Joi.object({
    siDate: Joi.date().required(),
    salesOrder: Joi.object({
      soRefNo: Joi.string()
        .max(10)
        .required(),
      customer: Joi.objectId().required()
    }),
    siRefNo: Joi.string()
      .max(10)
      .required(),
    remarks: Joi.string().max(500),
    terms: Joi.string().max(20),
    siItems: Joi.array().items(
      Joi.object({
        item: Joi.objectId().required(),
        qty: Joi.number()
          .min(0)
          .required(),
        price: Joi.number()
          .min(0)
          .required()
      })
    )
  });

  return schema.validate(salesInvoice);
}

exports.SalesInvoice = SalesInvoice;
exports.validate = validateSalesInvoice;
