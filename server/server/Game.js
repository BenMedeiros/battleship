'use strict';

import img_manifest from "../../assets/img/img_manifest.js";
import {Player} from "./Player.js";
import {PlayerStatus, GamePhase, TileStates} from "./statuses.js";
import {Ship, PlayerShip} from "./Ships.js";

let game_id = 0;

export class Game {
  constructor(height, width, enemyAI) {
    this.id = game_id++;

    this.gameConfig = {
      players: 2,
      // how many tiles on each player's side
      height: height,
      width: width,
      // ships in games and sizes
      ships: [
        // new Ship(2, 'ship_2', img_manifest.ship_2),
        new Ship(3, 'ship_3', img_manifest.ship_3)
        // new Ship(4, 'ship_4', img_manifest.ship_4),
        // new Ship(5, 'ship_5', img_manifest.ship_5)
      ]
    };

    // playerId and info
    this.players = [];

    this.phase = GamePhase.waiting_for_players;
    this.board = createEmptyBoard(this.gameConfig.height, this.gameConfig.width);
  }

  canJoin(lobbyPlayer) {
    // can't join if already 2 players
    if (this.players.length >= 2) return false;

    for (const player of this.players) {
      // check if already in game
      if (player.id === lobbyPlayer.id) return false;
    }
    return true;
  }

  addPlayer(lobbyPlayer) {
    if (this.players.length === 0) {
      const player = new Player(this, lobbyPlayer, 'red', 'top');
      this.players.push(player);
      return player.id;

    } else if (this.players.length === 1) {
      const player = new Player(this, lobbyPlayer, 'blue', 'bottom');
      this.players.push(player);
      this.phase = GamePhase.place_ships;
      return player.id;

    } else {
      throw new Error('Two players already in game');
    }
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
    } else if (player.playerShips.find(el => el.ship.id === ship.id)) {
      throw new Error('Ship ' + ship.id + ' already placed');
    }

    player.playerShips.push(new PlayerShip(this.gameConfig, player, ship, x, y, rotationDeg));
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

function createEmptyBoard(height, width) {
  const board = [];
  for (let i = 0; i < height; i++) {
    board.push(new Array(width).fill(TileStates.empty));
  }
  return board;
}
