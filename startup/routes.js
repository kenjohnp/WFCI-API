const express = require("express");
const items = require("../routes/items");
const customers = require("../routes/customers");
const salesOrders = require("../routes/salesOrders");
const deliveryReceipts = require("../routes/deliveryReceipts");
const salesInvoices = require("../routes/salesInvoices");

module.exports = function(app) {
  app.use(express.json());
  app.use("/api/items", items);
  app.use("/api/customers", customers);
  app.use("/api/salesorders", salesOrders);
  app.use("/api/deliveryreceipts", deliveryReceipts);
  app.use("/api/salesinvoices", salesInvoices);
};
