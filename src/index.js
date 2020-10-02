const { app, BrowserWindow, Menu, ipcMain, globalShortcut } = require('electron');
const path = require('path');

let mainWindow;
let addWindow;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createMainWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1045,
    height: 815,
    icon:  __dirname + './images/icon.png',
    webPreferences: {
      nodeIntegration: true
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'pages/spellbook.html'));

  //Add Menu from template
  let menu = Menu.buildFromTemplate(mainMenuTemplate);
  Menu.setApplicationMenu(menu)

  //Explicily close app on window close
  mainWindow.on('closed', function() {
    app.quit();
  });
};

const createAddWindow = () =>{
  addWindow = new BrowserWindow({
    width: 657,
    height: 490,
    title: 'Add Spell',
    webPreferences: {
      nodeIntegration: true
    }
  })

  addWindow.loadFile(path.join(__dirname, 'pages/addSpell.html'))

  addWindow.on('close', () => {
    addWindow = null;
  })

  //Add Window Debug Menu
  let menu = Menu.buildFromTemplate(addMenuTemplate);
  addWindow.setMenu(menu);
}

//Clear Window Function
function clearWindow()
{
    mainWindow.webContents.send('spell:clear');
}

//template for menu
const mainMenuTemplate = [
  {
    label: '&File',
    submenu: [
      {
        label: '&Add Spell',
        click() {createAddWindow()}
      },
      {
        label: '&Clear Book',
        click(){clearWindow()}
      },
      {
        label: '&Quit',
        click(){app.quit()}
      }
    ]
  },
  {
    label: "&Debug",
    click(){mainWindow.webContents.openDevTools();}
  },
  {
    role: 'reload'
  }
];

//template for add
const addMenuTemplate = [
  {
    label: "&Debug",
    click(){addWindow.webContents.openDevTools();}
  },
  {
    role: 'reload'
  }
];

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createMainWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

//Setup Global Accelerator (ctrl-q to quit)
app.whenReady().then(() => {
  // Register a 'CommandOrControl+Q' shortcut listener.
  globalShortcut.register('CommandOrControl+Q', () => {
    app.quit();
  })
})

//Setup AddSpell IPC event
ipcMain.on('spell:add', (event, spell) => {
  console.log(spell);
  mainWindow.webContents.send('spell:add',spell);
  addWindow.close();
})


