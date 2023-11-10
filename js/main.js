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


populateSidebar();


const game = new Game();
console.log(game);


const gameProxyPlayer0 = new GameProxy(game, game.players[0]);
const gameProxyPlayer1 = new GameProxy(game, game.players[1]);


gameProxyPlayer0.syncGameState().then(async () => {
  const gridSystem = new GridSystem(gameProxyPlayer0);
  gridSystem.setupCanvas();
  console.log(gridSystem);

  let x = 0;


  for (const ship of game.gameConfig.ships) {
    // await gameProxyPlayer0.placeShip(ship, x++, 0, 90);
  }

  setTimeout(() => gridSystem.redrawPlayerShips(), 1000);

});
