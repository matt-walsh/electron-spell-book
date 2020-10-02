const electron = require('electron')
const {ipcRenderer} = electron


//Get add spell form
let form = document.querySelector('form');
form.addEventListener('submit', (event) =>{
    event.preventDefault();

    //get the value of each input and store in object
    let spell = {
        name: document.querySelector("#name").value,
        school: document.querySelector("#school").value,
        ritual:  document.querySelector("#ritual").checked,
        level: document.querySelector("#level").value,
        casting: document.querySelector("#casting").value,
        verbal: document.querySelector("#verbal").checked,
        somatic: document.querySelector("#somatic").checked,
        material: document.querySelector("#material").checked,
        materials: document.querySelector("#materials").value,
        reference: document.querySelector("#reference").value
    }
    ipcRenderer.send('spell:add', spell);
});