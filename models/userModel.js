const model = require("./model.js");

let user = {
  
  tableName: 'users',
  tableIsValid: model.tableIsValid,
  selectFirst: model.selectFirst,
  select: model.select,
  insert: model.insert,
  update: model.update
}

module.exports = user;