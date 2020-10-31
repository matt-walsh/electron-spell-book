const electron = require('electron')
const {ipcRenderer} = electron

//Get the add spell form and add submit event listener
let form = document.querySelector('form');
form.addEventListener('submit', (event) =>{
    event.preventDefault();//Prevent default submit

    //get the value of each input and store in object. Object keys must be same as table rows
    let spell = {
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
    ipcRenderer.send('spell:add', spell);
});


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