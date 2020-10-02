const electron = require('electron');
const {ipcRenderer} = electron;
const SPELLS_PER_PAGE = 5;

//catch add item
ipcRenderer.on('spell:add', (event, spell) =>{
  console.log(spell)
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
  deleteButton.innerText = "X";
  deleteButton.addEventListener('click', (event) =>{
    console.log(event);
    event.path[4].removeChild(event.path[3]);
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

  let ritualData = document.createElement('td');
  if(spell.ritual === true){
    ritualData.appendChild(document.createTextNode('X'));
  }
  dataRowTop.appendChild(ritualData);

  let levelData = document.createElement('td');
  levelData.appendChild(document.createTextNode(spell.level));
  dataRowTop.appendChild(levelData);

  let sourceData = document.createElement('td');
  sourceData.appendChild(document.createTextNode(spell.reference));
  dataRowTop.appendChild(sourceData);

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

  let timeData = document.createElement('th');
  timeData.appendChild(document.createTextNode(spell.casting));
  dataRowbottom.appendChild(timeData);

  let componentsData = document.createElement('th');
  let componentString = ""
  if(spell.verbal === true){
    componentString += "V";
  }
  if(spell.somatic === true){
    componentString += "S";
  }
  if(spell.material === true){
    componentString += "M";
  }
  componentsData.appendChild(document.createTextNode(componentString));
  dataRowbottom.appendChild(componentsData);

  let materialsData = document.createElement('th');
  materialsData.setAttribute('colspan', '3')
  materialsData.appendChild(document.createTextNode(spell.materials));
  dataRowbottom.appendChild(materialsData);

  //Append second data row to table
  spellTable.appendChild(dataRowbottom);

  //Append the spellTable to the page

  //Determine the number of non-text nodes on each side of the page
  let leftPage = document.querySelector('#left-page');
  let leftCount = 0;
  leftPage.childNodes.forEach((node, index, parent) => {
    if(node.nodeType === 1){
      leftCount++;
    }
  });

  let rightPage = document.querySelector('#right-page');
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

//Clear Spell Book
ipcRenderer.on('spell:clear', function(){
  document.querySelector('#left-page').innerText = '';
  document.querySelector('#right-page').innerText = '';
});
