const model = require("./model.js");

let message = {

  tableName: 'messages',
  tableIsValid: model.tableIsValid,
  select: model.select,
  insert: model.insert,
  paginate: model.paginate
}

module.exports = message;