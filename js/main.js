'use strict';

import {ButtonType} from "../html/tinyComponents/ButtonType.js";

import gameConfigScreen from "./app/gameConfigScreen.js";
import {GridSystem} from "./app/GridSystem.js";
import {populateSidebar} from "./app/assetPlacer.js";
import {Game} from "../server/server/Game.js";
import {GameProxy} from "../server/client/GameProxy.js";
import {Lobby} from "../server/server/Lobby.js";


const gameConfigI = new ButtonType('game-config', 'Game Config',
  gameConfigScreen.createWinScreen, false, null,
  document.getElementById("navigation-bar"));


const lobby = new Lobby();
const player1 = lobby.newPlayer('tom');
const player2 = lobby.newPlayer('ben');

console.log(lobby);

const game = lobby.createGame(player1.id, 9, 5, 'strong');
lobby.joinGame(player2.id, lobby.getOpenGame(player2.id).id);


const gameProxyPlayer0 = new GameProxy(game, player1);
const gameProxyPlayer1 = new GameProxy(game, player2);

let currentPlayerGameProxy = gameProxyPlayer0;
gameConfigScreen.bindGameProxy(currentPlayerGameProxy);

setTimeout(() => {
  populateSidebar(currentPlayerGameProxy.getGameConfig().ships);
}, 200);
