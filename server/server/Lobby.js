'use strict';

import {Game} from "./Game.js";

/*
* Lobby for players to list/join games
* */

let lobby_player_id = 0;

class LobbyPlayer {
  constructor(name) {
    this.id = lobby_player_id++;
    this.name = name;
  }
}

class Lobby {
  constructor() {
    this.games = [];
    this.players = [];
  }

  getGame(gameId) {
    const game = this.games.find(gm => gm.id === gameId);
    if (!game) throw new Error('Game not found for gameId ' + gameId);
    return game;
  }

  getPlayer(playerId) {
    const player = this.players.find(ply => ply.id === playerId);
    if (!player) throw new Error('Player not found for playerId ' + playerId);
    return player;
  }

  createGame(playerId, height, width, enemyAI, shipKeys) {
    const newGame = new Game(height, width, enemyAI);
    newGame.addPlayer(this.getPlayer(playerId));
    this.games.push(newGame);
    return newGame;
  }

  getOpenGame(playerId) {
    const lobbyPlayer = this.getPlayer(playerId);
    for (const game of this.games) {
      if (game.canJoin(lobbyPlayer)) return game;
    }
  }

  joinGame(playerId, gameId) {
    const game = this.getGame(gameId);
    game.addPlayer(this.getPlayer(playerId));
    return game;
  }

  newPlayer(name) {
    const newPlayer = new LobbyPlayer(name);
    this.players.push(newPlayer);
    return newPlayer;
  }
}


let globalLobby = new Lobby();

export function getGlobalLobby() {
  return globalLobby;
}
