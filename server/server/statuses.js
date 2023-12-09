'use strict';

/*
* Various enums for the game
* */

export const PlayerStatus = {
  // start of game, player in process of placing ships
  placing_ships: 0,
  // player has placed all ships, waiting for them to confirm ready
  ships_placed: 1,
  // player confirmed ships are placed and locked in
  ships_ready: 2,
  // waiting on player to choose attack location
  planning_attack: 3,
  // player attack submitted (no step for submit)
  reloading: 4,
  //  dead
  dead: 5,
  //  post game statuses
  win: 6,
  lose: 7,
  tie: 8
}

export const GamePhase = {
  waiting_for_players: 0,
  place_ships: 1,
  fight: 2,
  game_over: 3
}

export const TileStates = {
  empty: 0,
  hit: 1,
  miss: 2
}
