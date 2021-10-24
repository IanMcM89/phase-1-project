document.addEventListener('DOMContentLoaded', () => {
    fetchInitialCrew(fetchAdditionalCrew);
    createEventListener('#crew-form', 'submit', checkFormInputs);
    createEventListener('button.launch-btn', 'click', handleLaunch);
})

const initialCrew = ['Leela', 'Fry', 'Bender', 'Amy', 'Zoidberg', 'Hermes', 'Scruffy'];

const planets = {
    1: {
        name: 'the Moon',
        client: 'Lunar Park executives',
        },
    2: {
        name: 'Mars',
        client: 'Wongs',
        },
    3: {
        name: 'Eternium',
        client: 'Nibblonians',
        },
    4: {
        name: 'Globetrotter Homeworld',
        client: 'Globetrotters',
        },
    5: {
        name: 'Trisol',
        client: 'Trilosians',
        },
    6: {
        name: 'Neptune',
        client: 'Neptunians',
        },
    7: {
        name: 'Amphibious 9',
        client: 'Amphibiosans',
        },
    8: {
        name: 'Omicron Persei 8',
        client: 'Omicronians',
        },
    9: {
        name: 'Amazonia',
        client: 'Amazonians',
        },
    10: {
        name: 'Decapod 10',
        client: 'Decapodians',
        },
}

let crewCards = [];

//Fetch JSON data for initial crew:
const fetchInitialCrew = (cbFunction) => {
    initialCrew.forEach(crewMember => {
        fetch(`http://futuramaapi.herokuapp.com/api/v2/characters?search=${crewMember}`)
        .then(resp => resp.json())
        .then(jsonCharacter => {
            jsonCharacter[0].Name = crewMember;
            createAvailableList(jsonCharacter[0]);
        })
        .catch(err => console.error(err))
    })
    cbFunction();
}

//Fetch JSON data for custom crew:
const fetchAdditionalCrew = () => {
    fetch('http://localhost:3000/characters')
    .then(resp => resp.json())
    .then(json => json.forEach(crewMember => createAvailableList(crewMember)))
    .catch(err => console.error(err))
}

//Append given element parameter to a given parent parameter:
const appendElement = (parent, child) => document.querySelector(parent).appendChild(child);

const createEventListener = (element, action, cbFunction) => document.querySelector(element).addEventListener(action, (e) => cbFunction(e));

//Check if form inputs are empty:
const checkFormInputs = (e) => {
    e.preventDefault();
    
    let inputs = {
        name: e.target.name.value,
        image: e.target.image.value,
        species: e.target.species.value,
    }

    Object.values(inputs).includes('') ? throwSubmitError() : handleSubmit(e, inputs);
}

//Throws message if any input fields are empty:
const throwSubmitError = () => alert('You need to fill all input fields');

//Submit event handler function:
const handleSubmit = (e, inputs) => {
    let newCharacterObj = {
        id: '',
        Name: inputs.name,
        PicUrl: inputs.image,
        Species: inputs.species,
        likes: 0,
    }

    createAvailableList(newCharacterObj);
    
    postCrewMember(newCharacterObj);

    clearFormInputs(e, inputs);
}

//Reset form inputs after submit:
const clearFormInputs = (e, inputs) => Object.keys(inputs).forEach(input => e.target[input].value = '');

//Add click event listener to created li and append to DOM:
const createAvailableList = (crewMember) => {
    let li = createNewLi(crewMember);

    appendElement('#available-list', li);
}

//Create a new li for provided crewmember:
const createNewLi = (crewMember) => {
    let li = document.createElement('li');

    li.className = 'character-li';
    li.textContent = crewMember.Name;

    li.addEventListener('click', () => handleLiClick(crewMember, li));

    return li;
}

//li click event handler:
const handleLiClick = (crewMember, li) => {
    crewCards.length < 5? updateCrewList(crewMember, li) : alert('You dingbat! The Planet Express ship already has a full crew!');
}

const updateCrewList = (crewMember, li) => {
    crewCards.push(crewMember.Name);
    
    createCharacterCard(crewMember, li);

    li.className = 'selected';
}

//Create a div card for each given character:
const createCharacterCard = (crewMember, li) => {
    let card = document.querySelector('div.empty-character-card');

    card.className = 'filled-character-card';
    card.innerHTML = `
        <div class='header-div'>
            <button class="remove-btn">X</button>
        </div>
        <h3>${crewMember.Name}</h3>
        <img src="${crewMember.PicUrl}" class='character-image' />
        <p>${crewMember.Species}</p>
        <div class='footer-div'>
            <button class="like-btn">Like</button>
            <button class="fire-btn">Fire</button>
        </div>
    `;

    createCardEventListners(card, crewMember, li);
}

const createCardEventListners = (card, crewMember, li) => {
    card.querySelector('button.remove-btn').addEventListener('click', (e) => handleRemoveButton(e, crewMember, li));
    card.querySelector('button.fire-btn').addEventListener('click', (e) => handleFireButton(e, crewMember, li));
}

//Fire button event handler:
const handleFireButton = (e, crewMember, li) => {
    if (initialCrew.includes(crewMember.Name)) {
        alert(`You can\'t fire ${crewMember.Name}`);
    } else {
        removeCharacterCard(e, crewMember);

        console.log(crewMember.id);
        deleteCrewMember(crewMember);
    
        li.remove();
    }
}

//Remove button event handler:
const handleRemoveButton = (e, crewMember, li) => {
    removeCharacterCard(e, crewMember);

    li.className = 'character-li';
}

//Remove character div card from table:
const removeCharacterCard = (e, crewMember) => {
    e.target.parentElement.parentNode.remove();

    createEmptyCard();

    updateCrewCards(crewMember);
}

const createEmptyCard = () => {
    let emptyCard = document.createElement('div');

    emptyCard.className = 'empty-character-card';

    appendElement('#crew-cards', emptyCard);
}

//Remove character from crewCards array:
const updateCrewCards = (crewMember) => crewCards = crewCards.filter(character => character !== crewMember.Name);

const postCrewMember = (crewMember) => {
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

const deleteCrewMember = (crewMember) => {
    fetch(`http://localhost:3000/characters/${crewMember.id}`, {
        method: 'Delete',
    })
    .then(resp => resp.json())
    .then(json => console.log(json))
    .catch(err => console.error(err))
}

//Launch button event handler function
const handleLaunch = () => {
    let warningMessage = `The Planet Express ship needs ${5 - crewCards.length} more crew members before it can take off!`;

    document.querySelector('#launch-window').style.display = 'flex';

    //crewCards.length < 5 ? alert(warningMessage) : alert(generateLaunchAlert());
}

//Generates a success or failure message when launch button is clicked:
const generateLaunchAlert = () => {
    let currentCrew = `${crewCards.slice(0, 4).join(', ')} and ${crewCards.slice(4)}`;

    let planet = generateRandomPlanet();

    return generateRandomMessage(currentCrew, planet);
}

//Returns a random planet:
const generateRandomPlanet = () => planets[Math.ceil(Math.random() * 10)];

//Returns a random message:
const generateRandomMessage = (currentCrew, planet) => {
    let successMessage = `Hoozah! ${currentCrew} succesfully delivered the package to ${planet.name}. The ${planet.client} are quite pleased!`;
    let failMessage = `Oh bother! It seems ${currentCrew} failed to deliver the package to ${planet.name}. The ${planet.client} wont be happy about this...`;

    return Math.random() > 0.5 ? successMessage : failMessage;
}