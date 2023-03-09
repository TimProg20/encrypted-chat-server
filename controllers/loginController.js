const userModel = require("../models/userModel.js");
const connectionModel = require("../models/connectionModel.js");
const loginValidator = require("../validators/loginValidator.js");


function login(request) {

  let client = this;

  let validation = loginValidator(request);

  if (!validation.success) {
    client.emit('login', validation);
    return;
  }

  let { success, result: user } = userModel.selectFirst({ login: request.login, password: request.password, isDeleted: false });

  if (user === null) {
    client.emit('login', { success: false, result: 'Such user wasn\'t found' });
    return;
  }

  let response = connectionModel.selectFirst({ userId: user.id });

  if (!response.success) {
    client.emit('login', response);
    return;
  }

  if (response.result !== null) {
    client.emit('login', { success: false, result: 'Such user is already online' });
    return;
  }

  client.emit('login', { success: true, result: { login: user.login, id: user.id } });
}

module.exports = {
  login
};