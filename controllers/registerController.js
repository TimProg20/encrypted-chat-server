const userModel = require("../models/userModel.js");
const registerValidator = require("../validators/registerValidator.js");

function register(request) {

  let client = this;

  let validation = registerValidator(request);

  if (!validation.success) {
    client.emit('register', validation);
    return;
  }

  let { success, result: user } = userModel.selectFirst({ login: request.login, isDeleted: false });

  if (!success) {
    client.emit('register', { success: false, result: user });
    return;
  }

  if (user !== null) {
    client.emit('register', { success: false, result: 'Such user already exists' });
    return;
  }

  let response = userModel.insert({ login: request.login, password: request.password, isDeleted: false });

  if (response.success) {
    response.result = {login: request.login, id: response.result};
  }

  client.emit('register', response);
}

module.exports = {
  register
};