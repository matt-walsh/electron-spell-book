const electron = require('electron');
const {ipcRenderer} = electron;
const SPELLS_PER_PAGE = 5;

function createSpellTable(spell){
  //Create spell table Element
  let spellTable = document.createElement('table');
  
  //Create five table heading cells and add each to the first head row
  let headRowTop = document.createElement('tr');

  let nameHeading = document.createElement('th');
  nameHeading.appendChild(document.createTextNode('Name'));
  headRowTop.appendChild(nameHeading);

  let schoolHeading = document.createElement('th');
  schoolHeading.appendChild(document.createTextNode('School'));
  headRowTop.appendChild(schoolHeading);

  let ritualHeading = document.createElement('th');
  ritualHeading.appendChild(document.createTextNode('Ritual'));
  headRowTop.appendChild(ritualHeading);

  let levelHeading = document.createElement('th');
  levelHeading.appendChild(document.createTextNode('Lvl'));
  headRowTop.appendChild(levelHeading);

  let sourceHeading = document.createElement('th');
  sourceHeading.appendChild(document.createTextNode('Source'));
  headRowTop.appendChild(sourceHeading);

  //Create Delete button and onClick handlers
  let deleteButton = document.createElement('button');
  deleteButton.setAttribute('class', 'delete-button');
  deleteButton.setAttribute('data-spell-id', spell.id);
  deleteButton.innerText = "🗑️";
  deleteButton.addEventListener('click', (event) =>{
    console.log(event);
    ipcRenderer.send("spell:delete", event.target.dataset.spellId)
  })

  //Append button to cell, and the cell to the row
  let deleteCell = document.createElement('th');
  deleteCell.appendChild(deleteButton);
  headRowTop.appendChild(deleteCell);

  //Append first head row to table
  spellTable.appendChild(headRowTop);

  //Create five table cells to hold spell details and add each to the first data row
  let dataRowTop = document.createElement('tr');

  let nameData = document.createElement('td');
  nameData.appendChild(document.createTextNode(spell.name));
  dataRowTop.appendChild(nameData);

  let schoolData = document.createElement('td');
  schoolData.appendChild(document.createTextNode(spell.school));
  dataRowTop.appendChild(schoolData);
  //TODO: Show School Name Instead of id

  let ritualData = document.createElement('td');
  if(Number.parseInt(spell.ritual) === 1){
    ritualData.appendChild(document.createTextNode('X'));
  }
  dataRowTop.appendChild(ritualData);

  let levelData = document.createElement('td');
  levelData.appendChild(document.createTextNode(spell.level));
  dataRowTop.appendChild(levelData);

  let sourceData = document.createElement('td');
  sourceData.appendChild(document.createTextNode(spell.source));
  dataRowTop.appendChild(sourceData);

  //Create Update button and onClick handlers
  let updateButton = document.createElement('button');
  updateButton.setAttribute('class', 'update-button');
  updateButton.setAttribute('data-spell-id', spell.id);
  updateButton.innerText = "✏️";
  updateButton.addEventListener('click', (event) =>{
    console.log(event);
    ipcRenderer.send("spell:showUpdate", event.target.dataset.spellId)
  })

  //Append button to cell, and the cell to the row
  let updateCell = document.createElement('th');
  updateCell.appendChild(updateButton);
  dataRowTop.appendChild(updateCell);

  //Append first data row to table
  spellTable.appendChild(dataRowTop)

  //Create three table heading cells and add each to the second head row
  let headRowbottom = document.createElement('tr');

  let timeHeading = document.createElement('th');
  timeHeading.appendChild(document.createTextNode('Time'));
  headRowbottom.appendChild(timeHeading);

  let componentsHeading = document.createElement('th');
  componentsHeading.appendChild(document.createTextNode('Components'));
  headRowbottom.appendChild(componentsHeading);

  let materialsHeading = document.createElement('th');
  materialsHeading.setAttribute('colspan', '3')
  materialsHeading.appendChild(document.createTextNode('Materials'));
  headRowbottom.appendChild(materialsHeading);

  //Append second header row to table
  spellTable.appendChild(headRowbottom);

  //Create three table cells to hold spell details and add each to the second data row
  let dataRowbottom = document.createElement('tr');

  let timeData = document.createElement('td');
  timeData.appendChild(document.createTextNode(spell.time));
  dataRowbottom.appendChild(timeData);

  let componentsData = document.createElement('td');
  let componentString = ""
  if(Number.parseInt(spell.verbal) === 1){
    componentString += "V";
  }
  if(Number.parseInt(spell.somatic) === 1){
    componentString += "S";
  }
  if(Number.parseInt(spell.material) === 1){
    componentString += "M";
  }
  componentsData.appendChild(document.createTextNode(componentString));
  dataRowbottom.appendChild(componentsData);

  let materialsData = document.createElement('td');
  materialsData.setAttribute('colspan', '3')
  materialsData.appendChild(document.createTextNode(spell.materials));
  dataRowbottom.appendChild(materialsData);

  //Append second data row to table
  spellTable.appendChild(dataRowbottom);

  return spellTable;
}

//Applies a theme, if the setting has been saved.
function applyTheme(theme){
  //Get a reference to the style style sheet link tag
  let currentSheet = document.getElementById('spellbook-style');

  switch (theme) {
    case 'dark':
      currentSheet.href = "../styles/spellbook-styles-dark.css";
      break;
  
    default:
      currentSheet.href = "../styles/spellbook-styles-default.css";
      break;
  }
}

ipcRenderer.on('spell:refresh', (event, spells) =>{
  //Clear pages for refresh
  let rightPage = document.querySelector('#right-page');
  let leftPage = document.querySelector('#left-page');
  rightPage.innerHTML = "";
  leftPage.innerHTML = "";

  //Create array of spellTables
  let spellTables = spells.map(spell => {
    return createSpellTable(spell);
  });

  //Append the spellTables to the page
  spellTables.forEach(spellTable =>{
    //Determine the number of non-text nodes on each side of the page
    let leftCount = 0;
    leftPage.childNodes.forEach((node, index, parent) => {
      if(node.nodeType === 1){
        leftCount++;
      }
    });

    
    let rightCount = 0;
    rightPage.childNodes.forEach((node, index, parent) => {
      if(node.nodeType === 1){
        rightCount++;
      }
    });

    //if left column is full, put into right column 
    if(leftCount < SPELLS_PER_PAGE){
      leftPage.appendChild(spellTable);
    }
    else if(rightCount < SPELLS_PER_PAGE){
      rightPage.appendChild(spellTable);
    }
  });
});

ipcRenderer.on('settings:apply', (event, savedSettings) =>{
  //Change href value to correct theme
  if(savedSettings.theme){
    applyTheme(savedSettings.theme);
  }

  //TODO: Update spell slots from saved settings
})



//Clear Spell Book
ipcRenderer.on('spell:clear', () =>{
  document.querySelector('#left-page').innerText = '';
  document.querySelector('#right-page').innerText = '';
});
