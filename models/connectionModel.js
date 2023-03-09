const model = require("./model.js");

let connection = {

  tableName: 'connections',
  tableIsValid: model.tableIsValid,
  selectFirst: model.selectFirst,
  insert: model.insert,
  remove: model.remove
}

module.exports = connection;