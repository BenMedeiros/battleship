'use strict';

/*
* Pop up screen showing Win information
* uses winScreen.css
* */


import {ButtonType} from "../../html/tinyComponents/ButtonType.js";
import {SelectInputType} from "../../html/tinyComponents/SelectInputType.js";
import {LabelInputType} from "../../html/tinyComponents/LabelInputType.js";
import {getGlobalLobby} from "../../server/server/Lobby.js";
import {GameProxy} from "../../server/client/GameProxy.js";

let winScreenElement = null;

let gameProxyPlayer0 = null;
let gameProxyAi = null;

const savedConfig = {
  name: 'Tom',
  height: 9,
  width: 5
};

const inputElements = {};

// create screen to show if player won or lost
function createWinScreen() {
  if (winScreenElement) return;

  winScreenElement = document.createElement("div");
  winScreenElement.id = 'game-config-screen';
  winScreenElement.classList.add('game-config-screen');

  const div = document.createElement("div");
  div.innerText = 'Game Config';
  div.style.fontSize = 'xx-large';
  winScreenElement.appendChild(div);

  const isGameStarted = gameProxyPlayer0 && gameProxyPlayer0.isGameStarted();

  //player config
  inputElements.playerId = new LabelInputType('playerId', 'integer', 'ID',
    2828, null, true, winScreenElement);

  inputElements.name = new LabelInputType('name', 'string', 'Name',
    savedConfig.name, 'your name', isGameStarted, winScreenElement);

  inputElements.height = new LabelInputType('height', 'integer', 'Height',
    savedConfig.height, 'your name', isGameStarted, winScreenElement);

  inputElements.width = new LabelInputType('width', 'integer', 'Width',
    savedConfig.width, 'your name', isGameStarted, winScreenElement);

  inputElements.enemyAI = new SelectInputType('enemyAI', 'Enemy AI',
    null, {basic: 'basic', strong: 'strong'},
    null, isGameStarted, winScreenElement);
  inputElements.enemyAI.createElementIn(winScreenElement);

  const submit = new ButtonType('new-game', 'New Game', newGame, null, null, winScreenElement);

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

async function newGame() {
  if (gameProxyPlayer0) gameProxyPlayer0.destroy();
  if (gameProxyAi) gameProxyAi.destroy();

  const lobby = getGlobalLobby();
  const mainPlayer = lobby.players[0];

  const game = lobby.createGame(mainPlayer.id, inputElements.height.getValue(),
      inputElements.width.getValue(), inputElements.enemyAI.getValue());
  console.log(game);

  const aiPlayer = lobby.addAiToGame(game, inputElements.enemyAI.getValue())

  gameProxyPlayer0 = new GameProxy(game, mainPlayer);
  gameProxyPlayer0.bindAI();

  gameProxyAi = new GameProxy(game, aiPlayer);
  gameProxyAi.bindAI();

  await closeWinScreen();
}


export default {
  createWinScreen,
  closeWinScreen
}
