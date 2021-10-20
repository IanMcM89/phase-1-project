document.addEventListener('DOMContentLoaded', () => {
    fetchCrew('https://futuramaapi.herokuapp.com/api/v2/characters', callInitialCrew);
    setTimeout(fetchCrew('http://localhost:3000/characters', callAdditionalCrew), 1000);
    createFormSubmit();
})

let customCrew = [];

let crewCards = [];

//Fetch JSON data for given url and callback function:
const fetchCrew = (url, cbFunction) => {
    fetch(url)
    .then(resp => resp.json())
    .then(json => cbFunction(json))
    .catch(err => console.error(err))
}

//Call available crewmembers and fetch their data:
const callInitialCrew = (crew) => {
    (crew.slice(0,7)).forEach(crewMember => createAvailableList(crewMember));
}

//Call additional custom crewmembers and fetch their data:
const callAdditionalCrew = (crew) => {
    crew.forEach(crewMember => createAvailableList(crewMember));
}

//Append given element parameter to a given parent parameter:
const appendElement = (parent, child) => document.querySelector(parent).appendChild(child);

//Add a submit event listener to the submit button:
const createFormSubmit = () => document.querySelector('#crew-form').addEventListener('submit', (e) => handleSubmit(e));

//Submit event handler function:
const handleSubmit = (e) => {
    e.preventDefault();
    
    let newCrewObject = {
        id: e.target.id,
        Name: e.target.name.value,
        PicUrl: e.target.image.value,
        Species: e.target.species.value,
        likes: 0,
    }

    createAvailableList(newCrewObject);
    //postCrew(newCrewObject)
    clearInputs([e.target.name, e.target.image, e.target.species]);
}

//Clear form inputs after submit:
const clearInputs = (inputArray) => inputArray.forEach(input => input.value = '');

//Create a new li for provided crewmember:
const createLi = (crewMember) => {
    let li = document.createElement('li');

    li.className = 'character-li';
    li.textContent = crewMember.Name;

    return li;
}

//Add click event listener to created li and append to DOM:
const createAvailableList = (crewMember) => {
    let li = createLi(crewMember);

    //Add click event listener to each list item:
    li.addEventListener('click', (e) => handleLiClick(crewMember, li));

    //Append character li to DOM:
    appendElement('#available-list', li);
}

//li click event handler:
const handleLiClick = (crewMember, li) => {
    crewCards.length < 5? updateCrewList(crewMember, li) : alert('The Planet Express ship is full!');
}

const updateCrewList = (crewMember, li) => {
    createCharacterCard(crewMember);
    li.className = 'selected';
    crewCards.push(crewMember.Name);
}

//Create a div card for each given character:
const createCharacterCard = (crewMember) => {
    let card = document.createElement('div');
    
    card.className = 'character-card';
    card.innerHTML = `
        <h3>${crewMember.Name}</h3>
        <img src="${crewMember.PicUrl}" class='character-image' />
        <p>${crewMember.Species}</p>
        <div class='button-div'>
            <button class="like-btn">Promote</button>
            <button class="fire-btn">Fire</button>
        <div>
    `
    //Add submit event to fire button:
    card.querySelector('button.fire-btn').addEventListener('click', (e) => handleFireButton(e, crewMember));

    //Append character card to DOM:
    appendElement('#crew-cards', card);
}

//Fire button event handler:
const handleFireButton = (e, crewMember) => {
    //Remove character div card from table:
    e.target.parentElement.parentNode.remove();

    //Remove character from crewCards array:
    crewCards = crewCards.filter(character => character !== crewMember.Name);
}

const postCrew = (crewMember) => {
    fetch(`http://localhost:3000/characters`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        body: JSON.stringify(crewMember),
    })
    .then(resp => resp.json())
    .then(crewMember => console.log(crewMember))
    .catch(err => console.error(err))
}