const express = require("express");
const users = require("../routes/users");
const items = require("../routes/items");
const customers = require("../routes/customers");
const salesOrders = require("../routes/salesOrders");
const deliveryReceipts = require("../routes/deliveryReceipts");
const salesInvoices = require("../routes/salesInvoices");
const auth = require("../routes/auth");
const error = require("../middleware/error");

module.exports = function(app) {
  app.use(express.json());
  app.use("/api/users", users);
  app.use("/api/items", items);
  app.use("/api/customers", customers);
  app.use("/api/salesorders", salesOrders);
  app.use("/api/deliveryreceipts", deliveryReceipts);
  app.use("/api/salesinvoices", salesInvoices);
  app.use("/api/auth", auth);
  app.use(error);
};
