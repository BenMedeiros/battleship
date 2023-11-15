'use strict';

import {ButtonType} from "../html/tinyComponents/ButtonType.js";

import gameConfigScreen from "./app/gameConfigScreen.js";
import {GridSystem} from "./app/GridSystem.js";
import {populateSidebar} from "./app/assetPlacer.js";
import {Game} from "../server/server/Game.js";
import {GameProxy} from "../server/client/GameProxy.js";


const gameConfigI = new ButtonType('game-config', 'Game Config',
  gameConfigScreen.createWinScreen, false, null,
  document.getElementById("navigation-bar"));

const placeAssetsI = new ButtonType('place-assets', 'Place Assets',
  () => {
  }, false, null,
  document.getElementById("navigation-bar"));


const changePlayerI = new ButtonType('change-player', 'Change Player',
  changePlayer, false, null,
  document.getElementById("navigation-bar"));


function changePlayer() {
  if (currentPlayerGameProxy === gameProxyPlayer0) {
    currentPlayerGameProxy = gameProxyPlayer1;
  } else {
    currentPlayerGameProxy = gameProxyPlayer0;
  }

  const el = document.getElementById('team-turn');
  el.innerText = currentPlayerGameProxy.player.name;
  console.log(currentPlayerGameProxy.player);
}

function setupGridSystemAndSync(gameProxy) {
  gameProxy.syncGameState().then(async () => {
    const gridSystem = new GridSystem(gameProxy);
    gameProxy.setGridSystem(gridSystem);
    gridSystem.setupCanvas();
  });
}


const game = new Game();
console.log(game);


const gameProxyPlayer0 = new GameProxy(game, game.players[0]);
const gameProxyPlayer1 = new GameProxy(game, game.players[1]);
let currentPlayerGameProxy = gameProxyPlayer0;

setupGridSystemAndSync(gameProxyPlayer0);
setupGridSystemAndSync(gameProxyPlayer1);

setTimeout(() => {
  populateSidebar(currentPlayerGameProxy.getGameConfig().ships);
}, 200);
