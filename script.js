document.addEventListener('DOMContentLoaded', () => {
    fetchStaticCrew();
    fetchCustomCrew();

    document.querySelector('#crew-form').addEventListener('submit', checkFormInputs);
    document.querySelector('#launch-btn').addEventListener('click', () => fetchPlanet([Math.ceil(Math.random() * 10)]));
})

//Stock characters to choose from on page load (can't be removed with DELETE request):
const staticCrew = ['Leela', 'Philip J. Fry', 'Bender', 'Amy', 'Zoidberg', 'Hermes', 'Scruffy'];

//Fetch API data for static crew:
const fetchStaticCrew = () => {
    staticCrew.forEach(crewMember => {
        fetch(`http://futuramaapi.herokuapp.com/api/v2/characters?search=${crewMember}`)
        .then(resp => resp.json())
        .then(json => {
            json[0].Name = crewMember;
            createListItem(json[0]);
        })
        .catch(err => console.error(err))
    })
}

//Fetch API data for crew added from form submission:
const fetchCustomCrew = () => {
    fetch('http://localhost:3000/characters')
    .then(resp => resp.json())
    .then(json => json.forEach(crewMember => createListItem(crewMember)))
    .catch(err => console.error(err))
}

const createPopUpWindow = (message, imageURL = 'images/farnsworth-sad.png') => {
    const popUpWindow = document.querySelector('#pop-up-window-container');

    popUpWindow.style.display = 'flex';
    popUpWindow.innerHTML = `
        <div id='pop-up-window'>
            <img id='farnsworth-image' src=${imageURL}>
            <div id='message-container'>
                <p id='farnsworth-message'>${message}</p>
                <button id='confirm-btn'>CONFIRM</button>
            </div>
        </div>
    `

    popUpWindow.querySelector('#confirm-btn').onclick = () => popUpWindow.style.display = 'none';
}

//Checks if form inputs are empty before submission: 
const checkFormInputs = e => {
    e.preventDefault();

    let inputs = {
        name: e.target.name.value,
        image: e.target.image.value,
        species: e.target.species.value,
    }

    let warningMessage = '"You need to fill out ALL the Crew-Bobulator\'s input fields...';

    if (Object.values(inputs).includes('')) return createPopUpWindow(warningMessage);
    isDuplicate(e, inputs);
}

//Checks if crewmember already exists before submission:
const isDuplicate = (e, inputs) => {
    inputs.name = inputs.name.charAt(0).toUpperCase() + inputs.name.slice(1);

    let warningMessage = `My eyesight is a bit hazy these days, but I believe ${inputs.name} is already standing by...`;

    if ([...document.querySelectorAll('li')].find(li => li.textContent === inputs.name)) return createPopUpWindow(warningMessage);
    handleSubmit(e, inputs);
}

const handleSubmit = (e, inputs) => {
    let newCharacterObj = {
        id: '',
        Name: inputs.name,
        PicUrl: inputs.image,
        Species: inputs.species,
    }

    clearFormInputs(e, inputs);
    postCrewMember(newCharacterObj);
}

const clearFormInputs = (e, inputs) => Object.keys(inputs).forEach(input => e.target[input].value = '');

//POST custom crewmember to localhost3000 API:
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
    .then(json => {
        console.log(json);
        createListItem(json);
    })
    .catch(err => console.error(err))
}

//Adds list item for given crewmember to available crew list:
const createListItem = crewMember => {
    let li = document.createElement('li');

    li.className = 'li-deselected';
    li.textContent = crewMember.Name;
    li.onclick = () => handleListItemClick(crewMember, li);

    document.querySelector('#available-crew-list').appendChild(li);
}

const handleListItemClick = (crewMember, li) => {
    let warningMessage = '"The Planet Express ship already has a full crew, you dingbat! Don\'t you have a delivery to make?...or do you? My memory isn\'t quite what it used to be..."'

    let selectedCrew = [...document.querySelectorAll('#crewmember-name')].map(name => name.textContent);

    if (selectedCrew.length < 5) return createCharacterCard(crewMember, li);
    createPopUpWindow(warningMessage);
}

//Creates a crew card for given crewmember
const createCharacterCard = (crewMember) => {
    const characterCard = document.querySelector('div.empty-card');
    characterCard.className = 'filled-card';
    characterCard.innerHTML = `
        <div class='header-div'>
            <button class="remove-btn">X</button>
        </div>
        <h3 id='crewmember-name'>${crewMember.Name}</h3>
        <img src="${crewMember.PicUrl}" class='character-image' />
        <p>${crewMember.Species}</p>
        <div class='star-rating'>
            <img src='images/star.png' class='star'>
            <img src='images/star.png' class='star'>
            <img src='images/star.png' class='star'>
            <img src='images/star.png' class='star'>
            <img src='images/star.png' class='star'>
        </div>
        <div class='footer-div'>
            <button class="fire-btn">Fire</button>
        </div>
    `;

    characterCard.querySelector('button.remove-btn').onclick = () => removeCharacterCard(crewMember);
    characterCard.querySelector('button.fire-btn').onclick = () => handleFireButton(crewMember);

    handleStarRating(characterCard);
    selectCrewMember(crewMember);
}

const handleStarRating = characterCard => {
    let starsArray = [...characterCard.querySelectorAll('img.star')];

    starsArray.forEach(star => star.onclick = () => {
        let index = starsArray.indexOf(star);

        if (star.className === 'star') {
            starsArray.filter(star => starsArray.indexOf(star) <= index).forEach(star => star.className = 'star-active');
        } else {
            starsArray.filter(star => starsArray.indexOf(star) > index).forEach(star => star.className = 'star');
        }
    })
}

//Adds given crewmember's name to selected crew array and makes the crewmember unable to be reselected:
const selectCrewMember = (crewMember) => {
    [...document.querySelectorAll('li')].find(li => li.textContent === crewMember.Name).className = 'li-selected';
}

const handleFireButton = (crewMember) => {
    if (staticCrew.includes(crewMember.Name)) {
        let warningMessage = `You can\'t fire ${crewMember.Name}! Planet Express shareholders are off limits...confounded bureaucracy...`;

        createPopUpWindow(warningMessage);
    } else {
        [...document.querySelectorAll('li')].find(li => li.textContent === crewMember.Name).remove();

        deleteCrewMember(crewMember);
    }
}

const removeCharacterCard = (crewMember) => {
    [...document.querySelectorAll('h3')].find(h3 => h3.textContent === crewMember.Name).parentElement.remove();

    createEmptyCard();
    deselectCrewMember(crewMember);
}

const createEmptyCard = () => {
    let emptyCharacterCard = document.createElement('div');
    emptyCharacterCard.className = 'empty-card';

    document.querySelector('#character-cards').appendChild(emptyCharacterCard);
}

//Removes provided crewmember from selected crew array and changes crewmember li to deselected class:
const deselectCrewMember = crewMember => {
    [...document.querySelectorAll('li')].filter(li => li.textContent === crewMember.Name).forEach(li => li.className = 'li-deselected');
}

//Sends crewmember DELETE request to localhost3000 API:
const deleteCrewMember = (crewMember) => {
    fetch(`http://localhost:3000/characters/${crewMember.id}`, {
        method: 'Delete',
    })
    .then(resp => resp.json())
    .then(json => console.log(json))
    .then(removeCharacterCard(crewMember))
    .catch(err => console.error(err))
}

//Fetch API data for random planet:
const fetchPlanet = (id) => {
    fetch(`http://localhost:3000/planets/${id}`)
    .then(resp => resp.json())
    .then(json => handleLaunchButton(json))
    .catch(err => console.error(err))
}

const handleLaunchButton = (planet) => {
    let selectedCrew = [...document.querySelectorAll('#crewmember-name')].map(name => name.textContent);

    let warningMessage = `"The Planet Express ship needs ${5 - selectedCrew.length} more crew before it can depart..."`;

    let crew = `${selectedCrew.slice(0, 4).join(', ')} and ${selectedCrew.slice(4)}`;

    selectedCrew.length < 5 ? createPopUpWindow(warningMessage) : generateDeliveryMessage(crew, planet);
}

//Generates a success or failure message based on 50/50 outcome:
const generateDeliveryMessage = (crew, planet) => {
    let successMessage = `"Hoozah! ${crew} were able to successfully deliver the ${planet.Cargo} to ${planet.Name}. The ${planet.Client} are quite pleased!"`;
    let failureMessage = `"Oh bother! It appears that ${crew} failed to deliver the ${planet.Cargo} to ${planet.Name}. The ${planet.Client} wont be happy about this..."`;

    if (Math.random() >= 0.5) return createPopUpWindow(successMessage, 'images/farnsworth-happy.png');
    createPopUpWindow(failureMessage);
}