'use strict';

/*
* Pop up screen showing Win information
* uses winScreen.css
* */


import {ButtonType} from "../../html/tinyComponents/ButtonType.js";
import {SelectInputType} from "../../html/tinyComponents/SelectInputType.js";
import {LabelInputType} from "../../html/tinyComponents/LabelInputType.js";

let winScreenElement = null;
let winScreenLinkedGameProxy = null;

const savedConfig = {
  name: 'Tom',
  height: 9,
  width: 5
};

const inputElements = {};

// create screen to show if player won or lost
function createWinScreen() {
  console.log(winScreenLinkedGameProxy);

  if (winScreenElement) return;

  winScreenElement = document.createElement("div");
  winScreenElement.id = 'game-config-screen';
  winScreenElement.classList.add('game-config-screen');

  const div = document.createElement("div");
  div.innerText = 'Game Config';
  div.style.fontSize = 'xx-large';
  winScreenElement.appendChild(div);

  const isGameStarted = winScreenLinkedGameProxy.isGameStarted();

  //player config
  inputElements.idI = new LabelInputType('playerId', 'integer', 'ID',
    2828, null, true, winScreenElement);

  inputElements.nameI = new LabelInputType('name', 'string', 'Name',
    savedConfig.name, 'your name', isGameStarted, winScreenElement);

  inputElements.nameI = new LabelInputType('height', 'integer', 'Height',
    savedConfig.height, 'your name', isGameStarted, winScreenElement);

  inputElements.nameI = new LabelInputType('width', 'integer', 'Width',
    savedConfig.width, 'your name', isGameStarted, winScreenElement);

  inputElements.enemyAI = new SelectInputType('enemyAI', 'Enemy AI',
    null, {basic: 'basic', strong: 'strong'},
    null, isGameStarted, winScreenElement);
  inputElements.enemyAI.createElementIn(winScreenElement);

  const submit = new ButtonType('new-game', 'New Game', async () => {
    // newGame clears players so must be first
    console.log('new game btn');

    await closeWinScreen();
  }, null, null, winScreenElement);

  document.getElementById("main").appendChild(winScreenElement);

  setTimeout(() => {
    //  i guess i need timeout so it doesn't immediately close thru the propagation
    winScreenElement.addEventListener('click', event => event.stopPropagation());
    document.addEventListener('click', closeWinScreen);
    console.log('settings onp');
  }, 100);
}

async function closeWinScreen(event) {
  // event.stopPropagation();
  console.log('close win scree');
  if (!winScreenElement) return;

  for (const [key, inputElement] of Object.entries(inputElements)) {
    savedConfig[inputElement.name] = inputElement.getValue();
    inputElement.destroy();
    delete inputElements[key];
  }

  winScreenElement.remove();
  winScreenElement = null;
  document.removeEventListener('click', closeWinScreen);
}


export default {
  createWinScreen,
  closeWinScreen,
  bindGameProxy: (gameProxy) => winScreenLinkedGameProxy = gameProxy
}
