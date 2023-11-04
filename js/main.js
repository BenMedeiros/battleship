'use strict';

import {ButtonType} from "../html/tinyComponents/ButtonType.js";

import gameConfigScreen from "./app/gameConfigScreen.js";
import {setupCanvas} from "./app/gameboard.js";
import {populateSidebar} from "./app/assetPlacer.js";
import {Game} from "../server/server/Game.js";


const gameConfigI = new ButtonType('game-config', 'Game Config',
  gameConfigScreen.createWinScreen, false, null,
  document.getElementById("navigation-bar"));

const placeAssetsI = new ButtonType('place-assets', 'Place Assets',
  () => {
  }, false, null,
  document.getElementById("navigation-bar"));


setupCanvas();
populateSidebar();


const game = new Game();
console.log(game);

let x = 0;

for (const player of game.players) {
  x = 0;
  for (const ship of game.gameConfig.ships) {
    game.placeShip(player, ship, x++, 0, 90);
  }
}
