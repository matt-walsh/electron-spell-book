const { app, BrowserWindow, Menu, ipcMain, globalShortcut, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

//Import and configure Knex
let sqlite3 = require('sqlite3')
let knex = require("knex")({
  client: 'sqlite3',
  connection: {
    filename: path.resolve(__dirname, './data/spellbook.db')
  },
  useNullAsDefault: true
});

//Windows
let mainWindow;
let addWindow;
let updateWindow;

//User Settings
let userSettings;

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

  //Wait for window to finish loading before issueing ipc events
  mainWindow.webContents.on('did-finish-load', () => {
    //Load saved data from settings.json
    fs.readFile("./src/data/settings.json", (err, data) =>{
      //Output errors
      if(err) {
        console.log(err);
      }
      else{
        userSettings = JSON.parse(data)
        mainWindow.webContents.send('settings:apply',userSettings);
      }
    });

    //load spells and trigger refresh
    knex.select().table('spells').then(spells =>{
      mainWindow.webContents.send('spell:refresh',spells);
    });
  })
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

  //Wait for window to finish loading before issuing ipc events
  addWindow.webContents.on('did-finish-load', () => {
    //apply settings to window
    addWindow.webContents.send('settings:apply',userSettings);
    //load schools
    knex.select().table('schools').then(schools =>{
      addWindow.webContents.send('spell:loadSchool', schools);
    });
  })
}

const createUpdateWindow = (spellId) =>{
  updateWindow = new BrowserWindow({
    width: 657,
    height: 490,
    title: 'Update Spell',
    webPreferences: {
      nodeIntegration: true
    }
  })

  updateWindow.loadFile(path.join(__dirname, 'pages/updateSpell.html'))

  updateWindow.on('close', () => {
    updateWindow = null;
  })

  //Add Window Debug Menu
  let menu = Menu.buildFromTemplate(updateMenuTemplate)
  updateWindow.setMenu(menu);

  //Wait for window to finish loading before issueing ipc events
  updateWindow.webContents.on('did-finish-load', () => {
    //apply settings to window
    addWindow.webContents.send('settings:apply',userSettings);

    //load schools
    knex.select().table('schools').then(schools =>{
      updateWindow.webContents.send('spell:loadSchool', schools);
    });

    //Load spell
    knex('spells').where("id", spellId).then(spell =>{
      updateWindow.webContents.send('spell:loadSpell', spell[0]);
    });
  })
}

//Clear Window Function
function clearWindow()
{
    mainWindow.webContents.send('spell:clear');
}

//template for spellbook menu
const mainMenuTemplate = [
  {
    label: '&File',
    submenu: [
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
    label: '&Add Spell',
    click() {createAddWindow()}
  },
  {
    label: '&Theme',
    submenu:[
      {
        label: '&Default',
        click(){saveTheme('default')}
      },
      {
        label: 'Da&rk',
        click(){saveTheme('dark')}
      }
    ]
  },
  //DEBUG BELOW
  {
    label: "&Debug",
    click(){mainWindow.webContents.openDevTools();}
  },
  {
    label: "Refresh Data",
    click(){
      knex.select().table('spells').then(spells =>{
        mainWindow.webContents.send('spell:refresh',spells);
      });
    }
  },
  {
    role: 'reload'
  }
];

//template for add menu
const addMenuTemplate = [
  {
    label: "&Debug",
    click(){addWindow.webContents.openDevTools();}
  },
  {
    role: 'reload'
  }
];

//template for update menu
const updateMenuTemplate = [
  {
    label: "&Debug",
    click(){updateWindow.webContents.openDevTools();}
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
});

//Setup Show Update Window IPC Event
ipcMain.on("spell:showUpdate", (event, spellId) =>{
  createUpdateWindow(spellId);
})

//Setup Create Spell IPC event
ipcMain.on('spell:add', (event, spell) => {

  //Save spell to DB
  knex('spells').insert(spell).then(value =>{
    //Get all spells and send to spell:refresh event
    knex.select().table('spells').then(spells =>{
      mainWindow.webContents.send('spell:refresh',spells);
      addWindow.close();
    });
  })
});

//Setup Update Spell IPC Event
ipcMain.on('spell:update', (event, spell) =>{
  //Ensure spell exists
  knex('spells').select('id').where({'id': Number.parseInt(spell.id)})
  .then( spellId =>{
    //update spell in DB
    knex('spells').where('id', spellId[0].id).update(spell)
    .catch(error =>{
      console.log(error);
    })
    .then(rowCount => {
      //Refresh spellbook page
      knex.select().table('spells').then(spells =>{
        mainWindow.webContents.send('spell:refresh',spells);
        updateWindow.close();
      });
    })
  })
});

//Setup Delete Spell IPC Envent
ipcMain.on('spell:delete', (event, spellId) =>{
  //Ensure spell exists
  knex('spells').select('id').where({'id': Number.parseInt(spellId)})
  .then( spellId =>{
    //delete spell from DB
    knex('spells').where('id', spellId[0].id).del()
    .catch(error =>{
      console.log(error);
    })
    .then(rowCount => {
      //Refresh spellbook page
      knex.select().table('spells').then(spells =>{
        mainWindow.webContents.send('spell:refresh',spells);
      });
    })
  })
});

//Update the 'theme' value in settings.json
function saveTheme(theme){
  //Load saved data from settings.json
  fs.readFile("./src/data/settings.json", (err, data) =>{
    //Output errors
    if(err) {
      console.log(err);
    }
    else{
      let savedSettings = JSON.parse(data)
      savedSettings.theme = theme;

      let newSettings = JSON.stringify(savedSettings);
      fs.writeFile("./src/data/settings.json",newSettings,'utf8',() => {});
    }
  });
} 
