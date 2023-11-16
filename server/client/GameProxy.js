'use strict';

/*
* Client interface for server maintained game state.
* Server may be another client but still operates like server
*
* */


import userMessage from "../../html/components/userMessage.js";
import {ButtonType} from "../../html/tinyComponents/ButtonType.js";
import {PlayerStatus} from "../server/Player.js";

export class GameProxy {
  constructor(game, player) {
    this.isLocalServer = true;
    this.gameAPI = game;
    this.playerId = player.id;
    this.gameState = null;
    this.controls = {
      shipsReady: createShipsReadyBtn()
    };

    this.pollIntervalId = setInterval(this.syncGameState.bind(this), 4000);
  }

  destroy() {
    clearInterval(this.pollIntervalId);
  }

  bindGridSystem(gridSystem) {
    this.gridSystem = gridSystem;
  }

  getGameConfig() {
    return this.gameState.gameConfig;
  }

  getPlayers() {
    return this.gameState.players;
  }

  getPlayer() {
    return this.gameState.players.find(ply => ply.id === this.playerId);
  }

  setGridSystem(gridSystem) {
    this.gridSystem = gridSystem;
  }

  async syncGameState() {
    const newGameState = await JSON.parse(this.gameAPI.getGameState());
    //  would be better to not redraw everything but check for diffs
    // but for now just redrawing everything
    this.gameState = newGameState;
    if (this.gridSystem) this.gridSystem.redrawPlayerShips();

    // when sync, player status may change so update btns accordingly
    this.controls.shipsReady.disableIf(this.getPlayer().status !== PlayerStatus.ships_placed);

  }

  async placeShip(ship, x, y, rotationDeg) {
    try {
      await this.gameAPI.placeShip(this.getPlayer().id, ship, x, y, rotationDeg);
    } catch (e) {
      userMessage.errorMsg(e);
    }

    //   pretend we got a response from the server, and technically
    //   anything could have occurred
    await this.syncGameState();
  }
}


function createShipsReadyBtn() {
  return new ButtonType('ships-ready', 'Ships Ready',
    () => {
    }, true, null,
    document.getElementById("controls-bar"));
}
