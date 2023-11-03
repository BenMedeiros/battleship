'use strict';

import {ButtonType} from "../html/tinyComponents/ButtonType.js";

import gameConfigScreen from "./app/gameConfigScreen.js";
import {setupCanvas} from "./app/gameboard.js";
import {populateSidebar} from "./app/assetPlacer.js";


const gameConfigI = new ButtonType('game-config', 'Game Config',
  gameConfigScreen.createWinScreen, false, null,
  document.getElementById("navigation-bar"));

const placeAssetsI = new ButtonType('place-assets', 'Place Assets',
  () => {
  }, false, null,
  document.getElementById("navigation-bar"));


setupCanvas();
populateSidebar();

