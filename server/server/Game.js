'use strict';

import img_manifest from "../../assets/img/img_manifest.js";
import {Player} from "./Player.js";
import {PlayerStatus, GamePhase, TileStates} from "./statuses.js";
import {createEmptyBoard} from "./playerBoards.js";

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
    this.gameConfig = {
      players: 2,
      // how many tiles on each player's side
      height: 9,
      width: 5,
      // ships in games and sizes
      ships: [
        // new Ship(2, 'ship_2', img_manifest.ship_2),
        new Ship(3, 'ship_3', img_manifest.ship_3)
        // new Ship(4, 'ship_4', img_manifest.ship_4),
        // new Ship(5, 'ship_5', img_manifest.ship_5)
      ]
    };

    // playerId and info
    this.players = [
      new Player(this, 'Ben', 'yellow', 'top'),
      new Player(this, 'Tom', 'blue', 'bottom')
    ];

    this.phase = GamePhase.place_ships;
    this.board = createEmptyBoard(this.gameConfig.height, this.gameConfig.width);
  }

  // server response of game state, sent for every server request for sync
  getGameState(playerId) {
    // console.log(this);
    const response = JSON.parse(JSON.stringify(this));
    response.players.find(ply => ply.id !== playerId).playerShips.forEach(playerShip => {
      delete playerShip.rotationDeg;
      delete playerShip.shipSpacesXY;
      delete playerShip.x;
      delete playerShip.y;
    });

    return response;
  }

  getPlayerFromId(playerId) {
    return this.players.find(ply => ply.id === playerId);
  }

  getOpponent(player) {
    return this.players.find(ply => ply.id !== player.id);
  }

  // place player ship at location
  placeShip(playerId, ship, x, y, rotationDeg) {
    const player = this.getPlayerFromId(playerId);

    if (this.phase !== GamePhase.place_ships) {
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
      isSunk: false,
      x,
      y,
      rotationDeg,
      shipSpacesXY
    });

    console.log(player);
    player.updatePlayerStatus(this);

    return ship.assetKey + ' placed';
  }

  shipsReady(playerId) {
    const player = this.getPlayerFromId(playerId);
    player.shipsReady();

    // check if all players are ready for combat
    for (const player of this.players) {
      if (player.status !== PlayerStatus.ships_ready) {
        return 'Your ships are ready, waiting for other player';
      }
    }
    this.phase = GamePhase.fight;
    this.players.forEach(ply => ply.planAttack());

    return 'Ships ready, start the attack!';
  }

  attackLocation(playerId, x, y) {
    const player = this.getPlayerFromId(playerId);
    if (player.status !== PlayerStatus.planning_attack) {
      throw new Error('Not your attack planning phase');
    }

    const opponent = this.getOpponent(player);
    if (!opponent.isPlayerRegion(x, y)) {
      throw new Error('That is not your opponents region');
    } else if (this.board[y][x] !== TileStates.empty) {
      throw new Error('Tile already attacked');
    }
    const playerShipHit = opponent.isHit(x, y);
    this.board[y][x] = playerShipHit ? TileStates.hit : TileStates.miss;

    player.reloading();
    if (player.status === PlayerStatus.reloading && opponent.status === PlayerStatus.reloading) {
      player.finishReload();
      opponent.finishReload();
      player.checkIfDead();
      opponent.checkIfDead();

      if (player.status === PlayerStatus.dead) {
        this.phase = GamePhase.game_over;
        if (opponent.status === PlayerStatus.dead) {
          player.status = PlayerStatus.tie;
          opponent.status = PlayerStatus.tie;
          return 'Tie, both sides died.';
        } else {
          player.status = PlayerStatus.lose;
          opponent.status = PlayerStatus.win;
          return 'You Died!  Opponent wins';
        }
      } else {
        if (opponent.status === PlayerStatus.dead) {
          this.phase = GamePhase.game_over;
          player.status = PlayerStatus.win;
          opponent.status = PlayerStatus.lose;
          return 'YOU WIN!  Killed the enemy!'
        }
      }
    }

    if (playerShipHit) {
      return opponent.isShipSunk(playerShipHit) ? 'Hit and Sunk!' : 'Hit!';
    } else {
      return 'Miss...';
    }
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
      shipSpacesXY.push({x: i, y: j, hit: false});
    }
  }
  return shipSpacesXY;
}
