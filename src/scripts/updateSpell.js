const electron = require('electron')
const {ipcRenderer} = electron

//Get the update spell form and add submit event listener
let form = document.querySelector('form');
form.addEventListener('submit', (event) =>{
    event.preventDefault();//Prevent default submit
    console.log(document.querySelector("form"));
    //get the value of each input and store in object. Object keys must be same as table rows
    let spell = {
        id: document.querySelector("form").dataset.spellId,
        name: document.querySelector("#name").value,
        school: document.querySelector("#school").value,
        ritual:  document.querySelector("#ritual").checked,
        level: document.querySelector("#level").value,
        time: document.querySelector("#casting").value,
        verbal: document.querySelector("#verbal").checked,
        somatic: document.querySelector("#somatic").checked,
        material: document.querySelector("#material").checked,
        materials: document.querySelector("#materials").value,
        source: document.querySelector("#reference").value
    }
    ipcRenderer.send('spell:update', spell);
});

ipcRenderer.on('spell:loadSpell', (event, spell) =>{
    document.querySelector("form").setAttribute("data-spell-id", spell.id);
    document.querySelector("#name").value = spell.name;
    
    //Set correct school in drop down
    let schoolDropdown = document.querySelector("#school").childNodes;
    let dropdownArray = Array.from(schoolDropdown);
    dropdownArray.find(schoolOption => Number.parseInt(schoolOption.value) === spell.school).setAttribute('selected', true);

    document.querySelector("#ritual").checked = spell.ritual;
    document.querySelector("#level").value = spell.level;
    document.querySelector("#casting").value = spell.time;
    document.querySelector("#verbal").checked = spell.verbal;
    document.querySelector("#somatic").checked = spell.somatic;
    document.querySelector("#material").checked= spell.material;
    document.querySelector("#materials").value = spell.materials;
    document.querySelector("#reference").value = spell.source;
})

ipcRenderer.on('spell:loadSchool', (event, schools) =>{
    let schoolDropDown = document.querySelector("#school");

    //Create <option> tags and append to school drop down
    schools.forEach( school =>{
        let schoolElement = document.createElement('option');
        schoolElement.value = school.id;
        schoolElement.innerText = school.name;

        schoolDropDown.appendChild(schoolElement);
    })
    
})