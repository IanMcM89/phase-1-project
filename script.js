document.addEventListener('DOMContentLoaded', () => {
    fetchAllCrewMembers(staticCrew);

    document.querySelector('#crew-form').addEventListener('submit', checkFormInputs);
    document.querySelector('#launch-btn').addEventListener('click', handleLaunchButton);
})

const staticCrew = ['Leela', 'Fry', 'Bender', 'Amy', 'Zoidberg', 'Hermes', 'Scruffy'];

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
        name: 'the Globetrotter Homeworld',
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

let crewSelected = [];

const fetchAllCrewMembers = crew => crew.forEach(crewMember => fetchStaticCrew(crewMember)) & fetchCustomCrew();

//Fetch JSON data for initial crew:
const fetchStaticCrew = (crewMember) => {
    fetch(`http://futuramaapi.herokuapp.com/api/v2/characters?search=${crewMember}`)
    .then(resp => resp.json())
    .then(json => {
        json[0].Name = crewMember;
        createListItem(json[0]);
    })
    .catch(err => console.error(err))
}

//Fetch JSON data for custom crew:
const fetchCustomCrew = () => {
    fetch('http://localhost:3000/characters')
    .then(resp => resp.json())
    .then(json => json.forEach(crewMember => createListItem(crewMember)))
    .catch(err => console.error(err))
}

const appendElement = (parent, child) => document.querySelector(parent).appendChild(child);

const checkFormInputs = e => {
    e.preventDefault();

    let inputs = {
        name: e.target.name.value,
        image: e.target.image.value,
        species: e.target.species.value,
    }

    Object.values(inputs).includes('') ? emptyInputMessage() : handleSubmit(e, inputs);
}

const emptyInputMessage = () => createPopUpWindow('"You need to fill out ALL the Crew-Bobulator\'s input fields...you knucklehead."');

const handleSubmit = (e, inputs) => {
    let newCharacterObj = {
        id: '',
        Name: inputs.name,
        PicUrl: inputs.image,
        Species: inputs.species,
        likes: 0,
    }

    postCrewMember(newCharacterObj);

    clearFormInputs(e, inputs);
}

const postCrewMember = crewMember => {
    fetch(`http://localhost:3000/characters`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        body: JSON.stringify(crewMember),
    })
    .then(resp => resp.json())
    .then(crewMember => createListItem(crewMember))
    .catch(err => console.error(err))
}

const createListItem = (crewMember) => {
    let li = createNewLi(crewMember);

    appendElement('#available-list', li);
}

const clearFormInputs = (e, inputs) => Object.keys(inputs).forEach(input => e.target[input].value = '');

const createNewLi = crewMember => {
    let li = document.createElement('li');

    li.className = 'character-li';
    li.textContent = crewMember.Name;

    li.addEventListener('click', () => handleLiClick(crewMember, li));

    return li;
}

const handleLiClick = (crewMember, li) => {
    if (crewSelected.length < 5) return updateCrewList(crewMember, li);
    createPopUpWindow('"The Planet Express ship already has a full crew, you dingbat! Don\'t you have a delivery to make?...or do you? My memory isn\'t quite what it used to be..."');
}

const updateCrewList = (crewMember, li) => {
    crewSelected.push(crewMember.Name);
    
    createCharacterCard(crewMember, li);

    li.className = 'li-selected';
}

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
            <button class="fire-btn">Fire</button>
        </div>
    `;

    createCardEventListners(card, crewMember, li);
}

const createCardEventListners = (card, crewMember, li) => {
    card.querySelector('button.remove-btn').addEventListener('click', (e) => handleRemoveButton(e, crewMember, li));
    card.querySelector('button.fire-btn').addEventListener('click', (e) => handleFireButton(e, crewMember, li));
}

const handleFireButton = (e, crewMember, li) => {
    if (staticCrew.includes(crewMember.Name)) {
        createPopUpWindow(`You can\'t fire ${crewMember.Name}, you nincumpoop! Planet Express shareholders are off limits...confounded bureaucracy...`);
    } else {
        removeCharacterCard(e, crewMember);

        deleteCrewMember(crewMember);
    
        li.remove();
    }
}

const handleRemoveButton = (e, crewMember, li) => {
    removeCharacterCard(e, crewMember);

    li.className = 'character-li';
}

const removeCharacterCard = (e, crewMember) => {
    e.target.parentElement.parentNode.remove();

    createEmptyCard();

    updateCrewCards(crewMember);
}

const createEmptyCard = () => {
    let emptyCard = document.createElement('div');

    emptyCard.className = 'empty-character-card';

    appendElement('#character-cards', emptyCard);
}

const updateCrewCards = crewMember => crewSelected = crewSelected.filter(character => character !== crewMember.Name);

const deleteCrewMember = crewMember => {
    fetch(`http://localhost:3000/characters/${crewMember.id}`, {
        method: 'Delete',
    })
    .then(resp => resp.json())
    .then(json => console.log(json))
    .catch(err => console.error(err))
}

//Launch Button functionality:

const handleLaunchButton = () => {
    generateMessage();
}


const createPopUpWindow = (message, imageURL = 'images/farnsworth-sad.png') => {
    let popUpWindow = document.querySelector('#pop-up-window-container');

    popUpWindow.style.display = 'flex';
    
    document.querySelector('#pop-up-window-container').innerHTML = `
        <div id='pop-up-window'>
            <img id='farnsworth-image' src=${imageURL}>
            <div id='message-container'>
                <p id='farnsworth-message'>${message}</p>
                <button id='confirm-btn'>CONFIRM</button>
            </div>
        </div>
    `

    document.querySelector('#confirm-btn').addEventListener('click', () => popUpWindow.style.display = 'none');
}

const generateMessage = () => {
    if (crewSelected.length < 5) return createPopUpWindow(`"The Planet Express ship needs ${5 - crewSelected.length} more crew before it can depart..."`); createLaunchMessage();
}

const createLaunchMessage = () => {
    let currentCrew = `${crewSelected.slice(0, 4).join(', ')} and ${crewSelected.slice(4)}`;

    let planet = generateRandomPlanet();

    return generateRandomMessage(currentCrew, planet);
}

const generateRandomPlanet = () => planets[Math.ceil(Math.random() * 10)];

const generateRandomMessage = (currentCrew, planet) => {
    if (Math.random() >= 0.5) return handleDeliverySuccess(currentCrew, planet);
    handleDeliveryFailure(currentCrew, planet);
}

const handleDeliverySuccess = (currentCrew, planet) => {
    let successMessage = `"Hoozah! ${currentCrew} succesfully delivered the package to ${planet.name}. The ${planet.client} are quite pleased!"`;

    createPopUpWindow(successMessage, 'images/farnsworth-happy.png');
}

const handleDeliveryFailure = (currentCrew, planet) => {
    let failureMessage = `"Oh bother! It seems ${currentCrew} failed to deliver the package to ${planet.name}. The ${planet.client} wont be happy about this..."`;

    createPopUpWindow(failureMessage);
}