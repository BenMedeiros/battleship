'use strict';

/*
* Client interface for server maintained game state.
* Server may be another client but still operates like server
*
* */


export class GameProxy {
  constructor(game, player) {
    this.isLocalServer = true;
    this.gameAPI = game;
    this.player = player;
    this.gameState = null;

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

  setGridSystem(gridSystem) {
    this.gridSystem = gridSystem;
  }

  async syncGameState() {
    const newGameState = await JSON.parse(this.gameAPI.getGameState());
    //  would be better to not redraw everything but check for diffs
    // but for now just redrawing everything
    this.gameState = newGameState;
    if (this.gridSystem) this.gridSystem.redrawPlayerShips();
  }

  async placeShip(ship, x, y, rotationDeg) {
    await this.gameAPI.placeShip(this.player, ship, x, y, rotationDeg);
    //   pretend we got a response from the server, and technically
    //   anything could have occurred
    await this.syncGameState();
  }
}
