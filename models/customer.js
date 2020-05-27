/** @format */

const Joi = require("@hapi/joi");
const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 255
  },
  contactPerson: {
    type: String,
    maxlength: 50
  },
  contactNumber: {
    type: String,
    maxlength: 20
  },
  address: { type: String, maxlength: 255 },
  tinNo: {
    type: String,
    maxlength: 20
  },
  businessStyle: { type: String, maxlength: 50 },
  dateCreated: {
    type: Date,
    default: Date.now
  }
});

const Customer = mongoose.model("Customer", customerSchema);

function validateCustomer(customer) {
  const schema = Joi.object({
    name: Joi.string()
      .required()
      .max(255),
    contactPerson: Joi.string()
      .allow("")
      .optional()
      .max(50),
    contactNumber: Joi.string()
      .allow("")
      .optional()
      .max(20),
    address: Joi.string()
      .allow("")
      .optional()
      .max(255),
    tinNo: Joi.string()
      .allow("")
      .optional()
      .max(20),
    businessStyle: Joi.string()
      .allow("")
      .optional()
      .max(50)
  });

  return schema.validate(customer);
}

exports.customerSchema = customerSchema;
exports.Customer = Customer;
exports.validateCustomer = validateCustomer;
