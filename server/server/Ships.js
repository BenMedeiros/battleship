'use strict';

/*
* Build ships and player ships
* */

let unq_id_ship = 0;

export class Ship {
  constructor(size, assetKey, asset) {
    this.id = unq_id_ship++;
    this.size = size;
    this.assetKey = assetKey;
    this.asset = asset;
  }
}

export class PlayerShip {
  constructor(gameConfig, player, ship, x, y, rotationDeg) {
    this.ship = ship;
    this.isSunk = false;
    this.x = x;
    this.y = y;
    // get 0-359deg range
    this.rotationDeg = ((rotationDeg % 360) + 360) % 360;
    // {x, y} combinations of where the ship is located
    this.shipSpacesXY = buildShipSpaces(this.ship, this.x, this.y, this.rotationDeg);

    this.validateGameBoundaries(gameConfig.height, gameConfig.width);
    this.validatePlayerRegion(player.region);
    this.validateSpaceOccupied(player.playerShips);
  }

  validateGameBoundaries(height, width) {
    for (const {x, y} of Object.values(this.shipSpacesXY)) {
      if (x < 0 || x >= width) {
        throw new Error('Out of bounds on X ' + x + ',' + y);
      } else if (y < 0 || y >= height) {
        throw new Error('Out of bounds on Y ' + x + ',' + y);
      }
    }
  }

  validatePlayerRegion(playerRegion) {
    for (const {x, y} of Object.values(this.shipSpacesXY)) {
      // check if space in player region
      if (x < playerRegion.x0 || x > playerRegion.x1) {
        throw new Error('Outside player region X');
      } else if (y < playerRegion.y0 || y > playerRegion.y1) {
        throw new Error('Outside player region Y');
      }
    }
  }

  validateSpaceOccupied(playerShips) {
    for (const {x, y} of Object.values(this.shipSpacesXY)) {
      // validate if player already has overlap with ships
      for (const playerShip of Object.values(playerShips)) {
        for (const existingSpaceXY of Object.values(playerShip.shipSpacesXY)) {
          if (x === existingSpaceXY.x && y === existingSpaceXY.y) {
            throw new Error(`Space ${x},${y}, already occupied by ship ${playerShip.ship.id}`);
          }
        }
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
      shipSpacesXY.push({x: i, y: j, hit: false});
    }
  }
  return shipSpacesXY;
}
