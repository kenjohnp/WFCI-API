const express = require("express");
const items = require("../routes/items");
const customers = require("../routes/customers");
const salesOrders = require("../routes/salesorders");

module.exports = function(app) {
  app.use(express.json());
  app.use("/api/items", items);
  app.use("/api/customers", customers);
  app.use("/api/salesorders", salesOrders);
};
