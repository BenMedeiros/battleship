'use strict';


import {createEmptyBoard} from "./playerBoards.js";

let unq_id_player = 0;

export const PlayerStatus = {
  // start of game, player in process of placing ships
  placing_ships: 0,
  // player has placed all ships, waiting for them to confirm ready
  ships_placed: 1,
  // player confirmed ships are placed and locked in
  ships_ready: 2
}

export class Player {
  constructor(game, name, color, region) {
    this.id = unq_id_player++;
    this.name = name;
    this.color = color;
    this.status = PlayerStatus.placing_ships;

    if (region === 'top') {
      this.region = {
        name: 'top',
        x0: 0,
        x1: game.gameConfig.width - 1,
        y0: 0,
        y1: Math.floor(game.gameConfig.height / 2) - 1
      };
    } else if (region === 'bottom') {
      this.region = {
        name: 'bottom',
        x0: 0,
        x1: game.gameConfig.width - 1,
        y0: Math.ceil(game.gameConfig.height / 2),
        y1: game.gameConfig.height - 1
      }
    } else {
      throw new Error('Region type not supported');
    }

    this.playerBoard = createEmptyBoard(game.gameConfig.height, game.gameConfig.width);
    // stores player ship locations
    this.playerShips = [];
  }

  updatePlayerStatus(game) {
    if (this.status === PlayerStatus.placing_ships || this.status === PlayerStatus.ships_placed) {
      const playerReady = game.gameConfig.ships.length === this.playerShips.length;
      this.status = playerReady ? PlayerStatus.ships_placed : PlayerStatus.placing_ships;
    }
  }
}
