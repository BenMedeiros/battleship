'use strict';

import {PlayerStatus, tileStates} from "./statuses.js";

let unq_id_player = 0;

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

    // stores player ship locations
    this.playerShips = [];
  }

  isPlayerRegion(x, y) {
    if (this.region.x0 > x || this.region.x1 < x) {
      return false;
    } else if (this.region.y0 > y || this.region.y1 < y) {
      return false;
    }
    return true;
  }

  updatePlayerStatus(game) {
    if (this.status === PlayerStatus.placing_ships || this.status === PlayerStatus.ships_placed) {
      const playerReady = game.gameConfig.ships.length === this.playerShips.length;
      this.status = playerReady ? PlayerStatus.ships_placed : PlayerStatus.placing_ships;
    }
  }

  shipsReady() {
    if (this.status === PlayerStatus.placing_ships) {
      throw new Error('Ships not all placed yet');
    } else if (this.status === PlayerStatus.ships_placed) {
      this.status = PlayerStatus.ships_ready;
    } else {
      throw new Error('Ship placing phase already over');
    }
  }

  planAttack() {
    if (this.status === PlayerStatus.ships_ready) {
      this.status = PlayerStatus.planning_attack;
    } else {
      throw new Error('Not ready to plan attack');
    }
  }

  isHit(x, y) {
    for (const playerShip of this.playerShips) {
      for (const shipSpace of playerShip.shipSpacesXY) {
        if (x === shipSpace.x && y === shipSpace.y) {
          return tileStates.hit;
        }
      }
    }
    return tileStates.miss;
  }
}
