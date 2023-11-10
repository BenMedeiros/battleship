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
  }

  getGameConfig() {
    return this.gameState.gameConfig;
  }

  getPlayers() {
    return this.gameState.players;
  }

  async syncGameState() {
    const newGameState = await JSON.parse(this.gameAPI.getGameState());
    //  would be better to not redraw everything but check for diffs
    // but for now just redrawing everything
    this.gameState = newGameState;
  }

  async placeShip(ship, x, y, rotationDeg) {
    await this.gameAPI.placeShip(this.player, ship, x, y, rotationDeg);
    //   pretend we got a response from the server, and technically
    //   anything could have occurred
    await this.syncGameState();
  }
}
