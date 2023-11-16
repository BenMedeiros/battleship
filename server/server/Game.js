'use strict';

import img_manifest from "../../assets/img/img_manifest.js";
import {Player} from "./Player.js";

const gamePhases = {
  place_ships: 0,
}

let unq_id_ship = 0;

class Ship {
  constructor(size, assetKey, asset) {
    this.id = unq_id_ship++;
    this.size = size;
    this.assetKey = assetKey;
    this.asset = asset;
  }
}


export class Game {
  constructor() {
    this.turn = {
      player: 0,
      turn: 0,
      turnStartTime: null
    };

    this.gameConfig = {
      players: 2,
      // how many tiles on each player's side
      height: 9,
      width: 5,
      // ships in games and sizes
      ships: [
        new Ship(2, 'ship_2', img_manifest.ship_2),
        new Ship(3, 'ship_3', img_manifest.ship_3),
        new Ship(4, 'ship_4', img_manifest.ship_4),
        new Ship(5, 'ship_5', img_manifest.ship_5)
      ]
    };

    // playerId and info
    this.players = [
      new Player(this, 'Ben', 'yellow', 'top'),
      new Player(this, 'Tom', 'blue', 'bottom')
    ];

    this.phase = gamePhases.place_ships;
  }

  // server response of game state, sent for every server request for sync
  getGameState() {
    // console.log(this);
    return JSON.stringify(this);
  }

  // place player ship at location
  placeShip(playerId, ship, x, y, rotationDeg) {
    const player = this.players.find(ply => ply.id === playerId);

    if (this.phase !== gamePhases.place_ships) {
      throw new Error('Cant place ships during this phase');
    }
    if (player.playerShips.find(el => el.ship.id === ship.id)) {
      throw new Error('Ship ' + ship.id + ' already placed');
    }

    // get 0-359deg range
    rotationDeg = ((rotationDeg % 360) + 360) % 360;

    // {x, y} combinations of where the ship is located
    const shipSpacesXY = buildShipSpaces(ship, x, y, rotationDeg);

    for (const {x, y} of Object.values(shipSpacesXY)) {
      if (x < 0 || x >= this.gameConfig.width) {
        throw new Error('Out of bounds on X ' + x + ',' + y);
      } else if (y < 0 || y >= this.gameConfig.height) {
        throw new Error('Out of bounds on Y ' + x + ',' + y);
      }
      // check if space in player region
      if (x < player.region.x0 || x > player.region.x1) {
        throw new Error('Outside player region X');
      } else if (y < player.region.y0 || y > player.region.y1) {
        throw new Error('Outside player region Y');
      }

      checkIfShipSpaceOccupied(player.playerShips, x, y);
    }

    player.playerShips.push({
      ship,
      x,
      y,
      rotationDeg,
      shipSpacesXY
    });

    console.log(player);
    player.updatePlayerStatus(this);
  }

}

// validate if player already has overlap with ships
function checkIfShipSpaceOccupied(playerShips, x, y) {
  for (const playerShip of Object.values(playerShips)) {
    for (const existingSpaceXY of Object.values(playerShip.shipSpacesXY)) {
      if (x === existingSpaceXY.x && y === existingSpaceXY.y) {
        throw new Error(`Space ${x},${y}, already occupied by ship ${playerShip.ship.id}`);
      }
    }
  }
}

// place a ship for player in x/y/deg
function buildShipSpaces(ship, x, y, rotationDeg) {
  if (rotationDeg === 0) {
    return buildShipSpacesXY(x, x, y, y + ship.size - 1);
  } else if (rotationDeg === 90) {
    return buildShipSpacesXY(x - ship.size + 1, x, y, y);
  } else if (rotationDeg === 180) {
    return buildShipSpacesXY(x, x, y - ship.size + 1, y);
  } else if (rotationDeg === 270) {
    return buildShipSpacesXY(x, x + ship.size - 1, y, y);
  }
}

// create {x,y} array of spots the ship occupies
function buildShipSpacesXY(x0, x1, y0, y1) {
  const shipSpacesXY = [];
  for (let i = x0; i <= x1; i++) {
    for (let j = y0; j <= y1; j++) {
      shipSpacesXY.push({x: i, y: j});
    }
  }
  return shipSpacesXY;
}
