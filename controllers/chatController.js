const userModel = require("../models/userModel.js");
const messageModel = require("../models/messageModel.js");
const connectionModel = require("../models/connectionModel.js");

let temporaryConnections = [];

const maxPaginationCount = 5;

function init(client) {

  const userId = Number(client.handshake.query.userId);
  const userLogin = client.handshake.query.userLogin;

  let response = messageModel.select({ senderId: userId });

  if (!response.success) {
    client.emit('init', response);
    return;
  }

  let allMessages = response.result;

  response = messageModel.select({ receiverId: userId });

  if (!response.success) {
    client.emit('init', response);
    return;
  }

  allMessages = allMessages.concat(response.result);

  response = userModel.select();

  if (!response.success) {
    client.emit('init', response);
    return;
  }

  let users = response.result.map(function (user) {

    if (user.isDeleted) {
      user.login = 'DELETED';
    }

    let messagesCount = 0;

    let lastIndex = -1;
    let index = -1;

    let messages = allMessages.filter(function(item) {
      index++;
      if (item.receiverId == user.id || item.senderId == user.id) {
        lastIndex = index;
        return true;
      };
    });

    messagesCount = messages.length;

    response = connectionModel.selectFirst({ userId: user.id });

    if (!response.success) {
      client.emit('init', response);
      return;
    }

    console.log(user.id);

    let isOnline = response.result !== null;

    return { login: user.login, id: user.id, isOnline: isOnline, messagesCount: messagesCount, lastIndex: lastIndex};
  });

  if (!response.success) {
    return;
  }

  connectionModel.insert({ socketId: client.id, userId: userId });

  client.server.of('/chat').emit('userJoined', { userId: userId, userLogin: userLogin });

  client.emit('init', { success: true, result: users });
}

function disconnect(reason) {

  let client = this;

  const userId = Number(client.handshake.query.userId);
  const userLogin = client.handshake.query.userLogin;

  connectionModel.remove({ socketId: client.id });

  client.server.of('/chat').emit('userLeft', { userId: userId, userLogin: userLogin });

  temporaryConnections = temporaryConnections.filter( item => item.firstUserId !== userId && item.secondUserId !== userId );
}

function create(request) {

  console.log(request);

  let firstUserId = Number(request.firstUser);
  let secondUserId = Number(request.secondUser);

  let client = this;

  let response = connectionModel.selectFirst({ userId: secondUserId });

  if (!response.success) {
    client.emit('create', response);
    return;
  }

  if (response.result === null) {
    client.emit('create', { success: false, result: 'Such user isn\'t active' });
    return;
  }

  temporaryConnections.push({
    firstUserId: firstUserId,
    checkFirstKey: false,
    secondUserId: secondUserId,
    checkSecondKey: false
  });

  client.server.of('/chat').to(response.result.socketId).emit('createKey', {
    isInvited: true,
    secretKey: 'secret_key_2',
    userId: firstUserId,
  });

  client.emit('createKey', {
    isInvited: false,
    secretKey: 'secret_key_1',
    userId: secondUserId,
  });
}

function createKey(request) {

  console.log(request);

  let client = this;

  let index = temporaryConnections.findIndex(item => item.firstUserId === request.firstUserId && item.secondUserId === request.secondUserId);

  if (request.isInvited) {
    temporaryConnections[index].checkSecondKey = true;
  } else {
    temporaryConnections[index].checkFirstKey = true;
  }

  if (temporaryConnections[index].checkFirstKey && temporaryConnections[index].checkSecondKey) {

    let firstUserSocket = connectionModel.selectFirst({ userId: temporaryConnections[index].firstUserId });

    let secondUserSocket = connectionModel.selectFirst({ userId: temporaryConnections[index].secondUserId });

    client.server.of('/chat').to(firstUserSocket.result.socketId).emit('create', {
      success: true,
      result: temporaryConnections[index].secondUserId
    });

    client.server.of('/chat').to(secondUserSocket.result.socketId).emit('create', {
      success: true,
      result: temporaryConnections[index].firstUserId
    });

    temporaryConnections.splice(index, 1);
  }
}

function createMessage(request) {

  let client = this;

  const message = request.message;

  let response = connectionModel.selectFirst({ userId: request.message.receiverId });

  if (response.success) {
    
    messageModel.insert(message);
    console.log(response);
    if (response.result !== null) {
      client.to(response.result.socketId).emit("createMessage", {userId: message.senderId, login: request.login, value: message.value});
    }
  }
  
}

function showMessages(request) {

  let client = this;

  let response = userModel.selectFirst({ id: request.secondUser.id });

  if (!response.success) {
    client.emit('showMessages', response);
    return;
  }

  if (response.isDeleted) {
    request.secondUser.login = 'DELETED';
  }
  
  response = messageModel.paginate(
    {
      last: request.lastIndex,
      messagesCount: Number(request.messagesCount), 
      count: maxPaginationCount, 
      firstUserId: request.firstUser.id, 
      secondUserId: request.secondUser.id
    }
  );

  if (!response.success) {
    client.emit('showMessages', response);
    return;
  }

  for(let key in response.result.results) {

    response.result.results[key].senderLogin = (response.result.results[key].senderId === request.firstUser.id) 
    ? request.firstUser.login :
    (response.result.results[key].senderId === request.secondUser.id)
    ? request.secondUser.login :
    'Unknown User';
  }

  response.result.secondUserId = request.secondUser.id;

  client.emit('showMessages', response);
}

function removeUser() {

  let client = this;

  const userId= Number(client.handshake.query.userId);

  
  const where = { id:  userId }; 
  const set = { isDeleted: true };

  let response = userModel.update(where, set);

  if (response.success) {
    response.result = userId;
  }

  client.server.of('/chat').emit('removeUser', response);
}

module.exports = {
  init,
  disconnect,
  create,
  createKey,
  createMessage,
  showMessages,
  removeUser
};