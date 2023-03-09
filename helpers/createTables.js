const userModel = require("../models/userModel.js");
const messageModel = require("../models/messageModel.js");
const connectionModel = require("../models/connectionModel.js");

const model = require("../models/model.js");

module.exports = function() {

  model.createTable.call(userModel);
  model.createTable.call(messageModel);
  model.createTable.call(connectionModel);
};