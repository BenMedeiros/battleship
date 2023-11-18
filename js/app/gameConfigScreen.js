'use strict';

/*
* Pop up screen showing Win information
* uses winScreen.css
* */


import {ButtonType} from "../../html/tinyComponents/ButtonType.js";
import {SelectInputType} from "../../html/tinyComponents/SelectInputType.js";
import {LabelInputType} from "../../html/tinyComponents/LabelInputType.js";

let winScreenElement = null;

// create screen to show if player won or lost
function createWinScreen() {
  if (winScreenElement) return;
  const gameState = {};

  winScreenElement = document.createElement("div");
  winScreenElement.id = 'game-config-screen';
  winScreenElement.classList.add('game-config-screen');

  const div = document.createElement("div");
  div.innerText = 'Game Config';
  div.style.fontSize = 'xx-large';
  winScreenElement.appendChild(div);


  const div2 = document.createElement("div");
  div2.innerText = 'Setting';
  div2.style.fontSize = 'xx-large';
  winScreenElement.appendChild(div2);

  //player config
  const idI = new LabelInputType('playerId', 'integer', 'ID',
    123, null, true, winScreenElement);
  const nameI = new LabelInputType('name', 'string', 'Name',
    null, 'your name', false, winScreenElement);
  //game config
  const wordsMap = {a: 'a', b: 'b'};
  const wordKeyI = new SelectInputType('wordKey', 'Word List',
    null, wordsMap, null, false, winScreenElement);
  wordKeyI.createElementIn(winScreenElement);

  // clear players
  const clearPlayerBtn = new ButtonType('clear-players', 'Clear Players', () => {
    console.log('clcear players butn');
  }, null, null, winScreenElement);

  // allow player to update their team and the game wordKey
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

  winScreenElement.remove();
  winScreenElement = null;
  document.removeEventListener('click', closeWinScreen);
}


export default {
  createWinScreen,
  closeWinScreen
}
