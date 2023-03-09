
const {app, BrowserWindow} = require('electron');
const path = require('path');

const loginController = require("./controllers/loginController.js");
const registerController = require("./controllers/registerController.js");
const chatController = require("./controllers/chatController.js");

const createTables = require("./helpers/createTables.js");

createTables();

const io = require('socket.io')();

io.of('/login').on('connection', (client) => {

  console.log('login page');

  client.on("login", loginController.login);
});

io.of('/register').on('connection', (client) => {

  console.log('register page');

  client.on("register", registerController.register);
});

io.of('/chat').on('connection', (client) => {
  
  chatController.init(client);

  client.on("create", chatController.create);

  client.on("createKey", chatController.createKey);

  client.on("createMessage", chatController.createMessage);

  client.on("showMessages", chatController.showMessages);

  client.on("removeUser", chatController.removeUser);

  client.on('disconnect', chatController.disconnect);
});

io.listen(18092);

let mainWindow

function createWindow () {

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  mainWindow.loadFile('index.html')

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
