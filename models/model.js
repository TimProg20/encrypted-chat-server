const db = require('electron-db');

function createTable() {

  db.createTable(this.tableName, (success, result) => {
    console.log(result);
  });
}

function tableIsValid() {
  return db.valid(this.tableName);
}

function selectFirst(request) {

  if (!this.tableIsValid()) {

    return {
      success: false,
      result: "Table is invalid"
    };
  }

  let response;

  db.getRows(this.tableName, request, (success, result) => {

    if (!success) {

      response = {
        success: false,
        result: result
      };
    }

    response = {
      success: true,
      result: (result.length === 0) ? null : result[0]
    };
  });

  return response;
}

function select(request = null) {

  if (!this.tableIsValid()) {

    return {
      success: false,
      result: "Table is invalid"
    };
  }

  let response;

  if (request === null) {

    db.getAll(this.tableName, (success, result) => {

      response = {
        success: success,
        result: result
      };
    });

  } else {

    db.getRows(this.tableName, request, (success, result) => {

      response = {
        success: success,
        result: result
      };
    });
  }

  return response;
}

function insert(request) {

  if (!this.tableIsValid()) {

    return {
      success: false,
      result: "Table is invalid"
    };
  }

  let response;
            
  db.insertTableContent(this.tableName, request, (success, result) => {
    response = {
      success: success,
      result: result
    }
  });

  return response;
}

function remove(request) {

  if (!this.tableIsValid()) {

    return {
      success: false,
      result: "Table is invalid"
    };
  }

  let response;
            
  db.deleteRow(this.tableName, request, (success, result) => {
    response = {
      success: success,
      result: result
    }
  });

  return response;
}

function paginate(request) {

  if (!this.tableIsValid()) {

    return {
      success: false,
      result: "Table is invalid"
    };
  }

  let response;

  db.getPaginatedMultiRows(this.tableName, request, (success, result) => {

    response = {
      success: success,
      result: result
    };
  });

  return response;
}

function update(where, set) {

  if (!this.tableIsValid()) {

    return {
      success: false,
      result: "Table is invalid"
    };
  }

  let response;

  db.updateRow(this.tableName, where, set, (success, result) => {
    response = {
      success: success,
      result: result
    }
  });

  return response;
}

module.exports = {
  createTable,
  tableIsValid,
  selectFirst,
  select,
  insert,
  update,
  remove,
  paginate
};