'use strict';

import {createEmptyBoard} from "./playerBoards.js";

const gamePhases = {
  place_ships: 0,

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
      height: 5,
      width: 8,
      // ships in games and sizes
      ships: [
        // {id: 0, size: 2},
        // {id: 1, size: 3},
        // {id: 2, size: 3},
        {id: 3, size: 4},
        {id: 4, size: 5}
      ]
    };

    // playerId and info
    this.players = [
      {
        id: 0,
        name: 'Ben',
        color: 'red',
        playerBoard: createEmptyBoard(this.gameConfig.height, this.gameConfig.width),
        // stores player ship locations
        playerShips: []
      },
      {
        id: 1,
        name: 'Tom',
        color: 'blue',
        playerBoard: createEmptyBoard(this.gameConfig.height, this.gameConfig.width),
        playerShips: []
      }
    ];

    this.state = {
      phase: gamePhases.place_ships
    };
  }

  // place player ship at location
  placeShip(player, ship, x, y, rotationDeg) {
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

      checkIfShipSpaceOccupied(player.playerShips, x, y);
    }

    player.playerShips.push({
      ship,
      x,
      y,
      rotationDeg,
      shipSpacesXY
    });
  }
}

function checkIfShipSpaceOccupied(playerShips, x, y) {
  console.log(playerShips, x, y);
  for (const playerShip of Object.values(playerShips)) {
    for (const existingSpaceXY of Object.values(playerShip.shipSpacesXY)) {
      console.log(existingSpaceXY, x, y);
      if (x === existingSpaceXY.x && y === existingSpaceXY.y) {
        throw new Error(`Space ${x},${y}, already occupied by ship ${playerShip.ship.id}`);
      }
    }
  }
}

function buildShipSpaces(ship, x, y, rotationDeg) {
  if (rotationDeg === 0) {
    return buildShipSpacesXY(x, x + ship.size - 1, y, y);
  } else if (rotationDeg === 90) {
    return buildShipSpacesXY(x, x, y, y + ship.size - 1);
  } else if (rotationDeg === 180) {
    return buildShipSpacesXY(x - ship.size + 1, x, y, y);
  } else if (rotationDeg === 270) {
    return buildShipSpacesXY(x, x, y - ship.size + 1, y);
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
